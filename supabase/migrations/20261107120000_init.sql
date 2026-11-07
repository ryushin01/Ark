-- Ark 세계 신화 도서관 스키마
-- 읽기: 누구나 (작품은 공개 상태만)
-- 쓰기: 서버의 secret key(service_role)만. 어드민 권한은 앱의 세션에서 먼저 확인합니다.

create table public.pantheons (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  name_en text not null,
  region text not null,
  earliest_source text not null,
  era_label text not null,
  era_year integer not null,
  summary text not null,
  description text[] not null default '{}',
  cover_exhibit_id text not null,
  updated_at timestamptz not null default now()
);

create table public.figures (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  pantheon_slug text not null references public.pantheons (slug) on update cascade,
  name text not null,
  name_en text not null,
  epithet text not null,
  domains text[] not null default '{}',
  summary text not null,
  description text[] not null default '{}',
  sort_order integer not null default 1 check (sort_order >= 1),
  updated_at timestamptz not null default now()
);
create index figures_pantheon_slug_idx on public.figures (pantheon_slug);

create table public.exhibits (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  figure_slug text not null references public.figures (slug) on update cascade,
  title text not null,
  kind text not null check (kind in ('sculpture', 'painting', 'print', 'relief', 'manuscript', 'photograph')),
  date_label text,
  holder text,
  note text,
  -- 이미지: { src, width, height, alt, credit: { artist, license, licenseUrl, sourceUrl } }
  image jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index exhibits_figure_slug_idx on public.exhibits (figure_slug);

-- 대표 자료는 자료 테이블을 만든 뒤에 연결합니다. (계열 ↔ 자료가 서로 가리킴)
alter table public.pantheons
  add constraint pantheons_cover_exhibit_fk foreign key (cover_exhibit_id)
  references public.exhibits (id) deferrable initially deferred;

create table public.works (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  title_original text not null,
  medium text not null check (medium in ('game', 'anime', 'novel', 'visual-novel')),
  year integer check (year between 1900 and 2100),
  creator text,
  summary text,
  figure_slugs text[] not null default '{}',
  -- 작품 이미지(저작권자가 있음): 출처와 함께 어드민에서 올립니다.
  images jsonb not null default '[]',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 수정 시각 자동 갱신
create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pantheons_touch before update on public.pantheons for each row execute function public.touch_updated_at();
create trigger figures_touch before update on public.figures for each row execute function public.touch_updated_at();
create trigger exhibits_touch before update on public.exhibits for each row execute function public.touch_updated_at();
create trigger works_touch before update on public.works for each row execute function public.touch_updated_at();

-- RLS: 공개 읽기만 허용. 쓰기 정책은 두지 않으므로 anon·authenticated는 쓸 수 없습니다.
alter table public.pantheons enable row level security;
alter table public.figures enable row level security;
alter table public.exhibits enable row level security;
alter table public.works enable row level security;

create policy "누구나 계열을 읽음" on public.pantheons for select to anon, authenticated using (true);
create policy "누구나 신을 읽음" on public.figures for select to anon, authenticated using (true);
create policy "누구나 자료를 읽음" on public.exhibits for select to anon, authenticated using (true);
create policy "공개 작품만 읽음" on public.works for select to anon, authenticated using (status = 'published');

-- 이미지 저장소: 공개 읽기, 쓰기는 서버만
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);
