-- 어드민 로그인 실패 기록 (시도 횟수 제한)
-- IP는 저장하지 않고 SHA-256 해시만 저장합니다. 서버(secret key)만 읽고 씁니다.
create table public.admin_login_attempts (
  id bigint generated always as identity primary key,
  client_hash text not null,
  created_at timestamptz not null default now()
);
create index admin_login_attempts_lookup_idx on public.admin_login_attempts (client_hash, created_at desc);

alter table public.admin_login_attempts enable row level security;
-- 정책을 두지 않으므로 anon·authenticated는 읽거나 쓸 수 없습니다.
