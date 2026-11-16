-- 운영 배포 워크플로(.github/workflows/release.yml)가 코드의 콘텐츠(목업 데이터)를 어느 커밋까지 운영 DB에 반영했는지 적습니다.
-- 콘텐츠 반영 SQL과 같은 트랜잭션에서 고쳐, 반영과 기록이 함께 성공하거나 함께 실패합니다.
create table public.release_state (
  key text primary key,
  sha text not null check (sha ~ '^[0-9a-f]{40}$'),
  updated_at timestamptz not null default now()
);

alter table public.release_state enable row level security;
-- 정책을 두지 않으므로 anon·authenticated는 읽거나 쓸 수 없습니다. (워크플로가 DB 주소로만 씀)

-- 첫 반영의 비교 기준: 0.7.0(a9347f7). 0.8.0에서 고친 자료 4점(복희와 여와, 상아, 테스카틀리포카, 틀랄록)의 저작자 표기가
-- 운영 DB에 들어가지 않았으므로(시드는 이미 있는 행을 건너뜀), 첫 반영에서 그 뒤 코드에서 바뀐 행을 다시 넣어 바로잡습니다.
-- 나머지 행은 2026-11-16에 운영 DB와 코드를 비교해 값이 같음을 확인했습니다.
insert into public.release_state (key, sha) values ('content', 'a9347f759565fc51dc554bfb162beddb4198de5d');
