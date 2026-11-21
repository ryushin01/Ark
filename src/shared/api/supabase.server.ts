import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

import "server-only";

/** Supabase가 이 시간 안에 응답하지 않으면 요청을 끊습니다. 읽기는 내장 데이터로 대신합니다(repository.server.ts). */
const REQUEST_TIMEOUT_MS = 5000;

/** 시간 제한을 붙인 fetch. 호출한 쪽의 중단 신호도 그대로 따릅니다. */
const fetchWithTimeout: typeof fetch = (input, init) => {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
};

let client: SupabaseClient<Database> | null | undefined;

/**
 * 서버 전용 Supabase 클라이언트 (secret key, RLS를 거치지 않음)
 * SUPABASE_URL과 SUPABASE_SECRET_KEY가 없으면 null이고, 저장소는 메모리 목업을 씁니다.
 * 쓰기 권한은 이 클라이언트를 부르기 전에 앱의 어드민 세션에서 확인합니다.
 */
export function getSupabase() {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  client =
    url && key
      ? createClient<Database>(url, key, {
          auth: { persistSession: false },
          global: { fetch: fetchWithTimeout },
        })
      : null;
  return client;
}

export function isSupabaseEnabled() {
  return getSupabase() !== null;
}
