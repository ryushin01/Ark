/**
 * 테스트용 가짜 Supabase 클라이언트
 * 테이블마다 메모리 행 배열을 두고, 저장소(repository.server.ts)가 쓰는 쿼리
 * (select·eq·maybeSingle·insert·update·delete)만 흉내 냅니다.
 *
 * 쓰는 법) `vi.mock("@/shared/api/supabase.server", () => ({ getSupabase: () => fake.client }))`
 */

type Row = Record<string, unknown>;
type SupabaseError = { code?: string; message: string };
type Operation = "select" | "insert" | "update" | "delete";

export type FakeSupabase = {
  client: { from: (table: string) => FakeQuery };
  /** 테이블의 행 배열 (테스트에서 직접 넣거나 확인합니다) */
  rows: (table: string) => Row[];
  /** 이 동작을 오류로 돌려줍니다. null이면 다시 성공합니다. */
  fail: (operation: Operation, error: SupabaseError | null) => void;
  /** 모든 행과 오류 설정을 지웁니다. */
  reset: () => void;
};

type Response<D> = Promise<{ data: D; error: SupabaseError | null }>;

type FakeQuery = {
  select: (columns: string) => Response<Row[] | null> & {
    eq: (column: string, value: string) => { maybeSingle: () => Response<Row | null> };
  };
  insert: (row: Row) => Response<null>;
  update: (row: Row) => {
    eq: (column: string, value: string) => { select: (columns: string) => Response<Row[] | null> };
  };
  delete: () => {
    eq: (column: string, value: string) => { select: (columns: string) => Response<Row[] | null> };
  };
};

/** Postgres 고유 키 위반 */
const UNIQUE_VIOLATION = "23505";

/**
 * @param keyColumns 테이블별 기본 키 컬럼. 적지 않은 테이블은 "slug"입니다. (같은 키 insert를 막는 데 씀)
 */
export function createFakeSupabase(keyColumns: Record<string, string> = {}): FakeSupabase {
  const tables = new Map<string, Row[]>();
  const failures = new Map<Operation, SupabaseError>();

  const rows = (table: string) => {
    const existing = tables.get(table);
    if (existing) return existing;
    const created: Row[] = [];
    tables.set(table, created);
    return created;
  };
  const respond = <D>(operation: Operation, data: D): Response<D | null> => {
    const error = failures.get(operation);
    return Promise.resolve(error ? { data: null, error } : { data, error: null });
  };

  const from = (table: string): FakeQuery => {
    const keyColumn = keyColumns[table] ?? "slug";
    const matches = (column: string, value: string) => (row: Row) => row[column] === value;
    return {
      select: () =>
        Object.assign(
          respond(
            "select",
            rows(table).map((row) => structuredClone(row)),
          ),
          {
            eq: (column: string, value: string) => ({
              maybeSingle: () => {
                const found = rows(table).find(matches(column, value));
                return respond("select", found ? structuredClone(found) : null);
              },
            }),
          },
        ),
      insert: (row) => {
        const failure = failures.get("insert");
        if (failure) return Promise.resolve({ data: null, error: failure });
        if (rows(table).some(matches(keyColumn, String(row[keyColumn])))) {
          return Promise.resolve({
            data: null,
            error: { code: UNIQUE_VIOLATION, message: "duplicate key value" },
          });
        }
        rows(table).push(structuredClone(row));
        return Promise.resolve({ data: null, error: null });
      },
      update: (row) => ({
        eq: (column, value) => ({
          select: () => {
            if (failures.has("update")) return respond("update", []);
            const stored = rows(table);
            const changed = stored
              .map((current, index) => ({ current, index }))
              .filter(({ current }) => matches(column, value)(current));
            for (const { index } of changed) stored[index] = { ...stored[index], ...row };
            return respond(
              "update",
              changed.map(({ index }) => ({ [keyColumn]: stored[index][keyColumn] })),
            );
          },
        }),
      }),
      delete: () => ({
        eq: (column, value) => ({
          select: () => {
            if (failures.has("delete")) return respond("delete", []);
            const kept = rows(table).filter((row) => !matches(column, value)(row));
            const removed = rows(table).filter(matches(column, value));
            tables.set(table, kept);
            return respond(
              "delete",
              removed.map((row) => ({ [keyColumn]: row[keyColumn] })),
            );
          },
        }),
      }),
    };
  };

  return {
    client: { from },
    rows,
    fail: (operation, error) => {
      if (error) failures.set(operation, error);
      else failures.delete(operation);
    },
    reset: () => {
      tables.clear();
      failures.clear();
    },
  };
}
