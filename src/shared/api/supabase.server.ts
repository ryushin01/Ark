import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

import "server-only";

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
    url && key ? createClient<Database>(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export function isSupabaseEnabled() {
  return getSupabase() !== null;
}
