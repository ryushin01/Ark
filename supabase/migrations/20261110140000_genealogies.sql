-- 신화 계열의 계보. 계열마다 한 줄이며, 계보는 사람과 혼인(배우자·자식)이 중첩된 JSON입니다.
create table public.genealogies (
  pantheon_slug text primary key references public.pantheons (slug) on update cascade on delete cascade,
  source text not null,
  roots jsonb not null default '[]'::jsonb check (jsonb_typeof(roots) = 'array'),
  updated_at timestamptz not null default now()
);

alter table public.genealogies enable row level security;
create policy "누구나 계보를 읽음" on public.genealogies for select to anon, authenticated using (true);
