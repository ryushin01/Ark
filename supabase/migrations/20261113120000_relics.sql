-- 신화 속 유물. 지닌 이·관련 인물(figure_slugs), 생겨난 경위·힘·대가·문헌과 그림으로 쓸 소장 자료를 둡니다.
create table public.relics (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  name_en text not null,
  kind text not null check (kind in ('weapon', 'armor', 'ornament', 'tool', 'treasure')),
  figure_slugs text[] not null default '{}' check (cardinality(figure_slugs) > 0),
  origin text not null,
  power text not null,
  price text,
  source text not null,
  exhibit_id text references public.exhibits (id) on update cascade on delete set null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.relics enable row level security;
create policy "누구나 유물을 읽음" on public.relics for select to anon, authenticated using (true);
