import "server-only";

/** 지금 Supabase 대신 내장 데이터(메모리 목업)를 보여 주는 테이블 */
const fallbackTables = new Set<string>();

/**
 * Supabase를 읽지 못해 내장 데이터로 대신 보여 줬음을 남깁니다.
 * 같은 서버에서 다음에 그 테이블을 읽는 데 성공하면 지웁니다.
 */
export function markFallback(table: string, reason: unknown) {
  if (!fallbackTables.has(table)) {
    const message = reason instanceof Error ? reason.message : String(reason);
    console.warn(
      `[data] ${table}: Supabase를 읽지 못해 내장 데이터로 대신 보여 줍니다. (${message})`,
    );
  }
  fallbackTables.add(table);
}

export function markLive(table: string) {
  fallbackTables.delete(table);
}

/** 이 테이블을 지금 내장 데이터로 대신 보여 주는 중인지 */
export function isTableFallback(table: string) {
  return fallbackTables.has(table);
}

/** Supabase를 쓰도록 설정했지만 읽지 못해 내장 데이터를 보여 주는 중인지 */
export function isUsingFallbackData() {
  return fallbackTables.size > 0;
}
