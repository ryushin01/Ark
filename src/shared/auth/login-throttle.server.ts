import { headers } from "next/headers";

import { getSupabase } from "@/shared/api/index.server";

import "server-only";

/** 15분 안에 5번 틀리면 잠급니다. */
export const MAX_FAILURES = 5;
export const WINDOW_MINUTES = 15;

const TABLE = "admin_login_attempts";

/** Supabase를 쓰지 않을 때(개발·테스트)의 실패 기록 */
const memory = new Map<string, number[]>();

/** 요청한 쪽을 구분하는 값. IP는 저장하지 않고 해시만 씁니다. */
export async function getClientKey() {
  const list = await headers();
  const ip =
    list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`ark-login:${ip}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

const windowStart = (now: number) => now - WINDOW_MINUTES * 60 * 1000;

/** 최근 실패 횟수 */
export async function countRecentFailures(key: string, now = Date.now()) {
  const supabase = getSupabase();
  if (!supabase) return (memory.get(key) ?? []).filter((time) => time > windowStart(now)).length;
  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("client_hash", key)
    .gt("created_at", new Date(windowStart(now)).toISOString());
  if (error) throw new Error(`로그인 기록을 읽지 못했습니다: ${error.message}`);
  return count ?? 0;
}

export async function recordFailure(key: string, now = Date.now()) {
  const supabase = getSupabase();
  if (!supabase) {
    memory.set(key, [...(memory.get(key) ?? []).filter((time) => time > windowStart(now)), now]);
    return;
  }
  await supabase.from(TABLE).insert({ client_hash: key });
}

/** 로그인에 성공하면 그 쪽의 실패 기록을 지웁니다. */
export async function clearFailures(key: string) {
  const supabase = getSupabase();
  if (!supabase) {
    memory.delete(key);
    return;
  }
  await supabase.from(TABLE).delete().eq("client_hash", key);
}

/** 하루 지난 기록을 지웁니다. (일시 정지 방지 크론에서 함께 부름) */
export async function pruneLoginAttempts() {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase
    .from(TABLE)
    .delete()
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
}
