import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ky from "ky";

import type { Database } from "./database.types";

import "server-only";

/** Supabase가 이 시간 안에 응답하지 않으면 요청을 끊습니다. 읽기는 내장 데이터로 대신합니다(repository.server.ts). */
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Supabase 요청용 ky 인스턴스. Supabase가 응답을 그대로 받아 오류 상태도 스스로 해석하므로
 * HTTP 오류에서 예외를 던지지 않고(throwHttpErrors: false), 다시 시도하지도 않습니다(retry: 0).
 * ky의 timeout은 응답 머리를 기다리는 시간만 재므로, 본문을 읽는 동안에도 같은 시간 제한이
 * 걸리도록 중단 신호를 함께 넘깁니다(이전 fetch 버전과 같은 동작).
 */
const http = ky.create({ timeout: REQUEST_TIMEOUT_MS, throwHttpErrors: false, retry: 0 });

/** 시간 제한을 붙인 fetch 호환 함수. 호출한 쪽의 중단 신호도 그대로 따릅니다. */
const fetchWithTimeout: typeof fetch = (input, init) => {
  const deadline = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, deadline]) : deadline;
  return http(input, { ...init, signal });
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
