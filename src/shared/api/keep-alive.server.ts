import { getSupabase } from "./supabase.server";

import "server-only";

/**
 * Supabase 무료 프로젝트는 7일 동안 요청이 없으면 일시 정지됩니다.
 * Vercel Cron이 하루 한 번 이 함수를 불러 가벼운 조회를 보냅니다.
 */
export async function pingDatabase(): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: true, message: "Supabase를 쓰지 않습니다 (목업 저장소)." };
  const { error, count } = await supabase
    .from("pantheons")
    .select("slug", { count: "exact", head: true });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: `pantheons ${count}` };
}
