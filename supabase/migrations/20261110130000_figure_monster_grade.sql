-- 분류를 신·영웅·몬스터·그 밖의 존재로 바꾸고, 몬스터에 등급(신수·영수·몬스터)을 둡니다.
-- divine 신수: 초월적인 존재인 신에 육박하는 존재
-- spirit 영수: 사람에 준하는 사고를 하거나, 여러 문화권에서 소개되고 추앙받는 존재 (불사조 등)
-- common 몬스터: 그 밖의 모든 하등한 존재
alter table public.figures drop constraint figures_kind_check;
update public.figures set kind = 'monster' where kind = 'beast' or slug in ('rangda', 'thotsakan');
alter table public.figures
  add constraint figures_kind_check check (kind in ('god', 'hero', 'monster', 'other'));

alter table public.figures
  add column grade text check (grade in ('divine', 'spirit', 'common'));
update public.figures set grade = 'divine' where slug in ('illuyanka');
update public.figures set grade = 'spirit' where slug in ('turul', 'barong', 'were-jaguar', 'medusa', 'rangda', 'thotsakan');

-- 몬스터만 등급이 있습니다.
alter table public.figures
  add constraint figures_monster_grade_check check ((kind = 'monster') = (grade is not null));
