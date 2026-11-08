-- 신화 계열의 대륙. 홈 연대기를 대륙별로 거를 때 씁니다.
alter table public.pantheons
  add column continent text not null default 'asia'
  check (continent in ('asia', 'europe', 'africa', 'americas', 'oceania'));

update public.pantheons set continent = 'africa' where slug in ('egyptian');
update public.pantheons set continent = 'europe' where slug in ('greek', 'norse', 'celtic', 'finnish');
update public.pantheons set continent = 'americas' where slug in ('aztec', 'maya');
