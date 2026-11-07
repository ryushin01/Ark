import { createMockTable } from "./mock-table";
import { getSupabase } from "./supabase.server";

import type { Database } from "./database.types";

import "server-only";

type Tables = Database["public"]["Tables"];
export type TableName = keyof Tables;
/** Supabase 테이블의 행 (pnpm db:types로 만든 타입) */
export type TableRow<T extends TableName> = Tables[T]["Row"];
export type TableInsert<T extends TableName> = Tables[T]["Insert"];

export type Repository<M> = {
  list: () => Promise<M[]>;
  find: (key: string) => Promise<M | null>;
  /** 같은 키가 이미 있으면 "duplicate" */
  insert: (model: M) => Promise<M | "duplicate">;
  update: (key: string, model: M) => Promise<M | null>;
  remove: (key: string) => Promise<boolean>;
};

type RepositoryConfig<T extends TableName, M> = {
  /** Supabase 테이블 이름 */
  table: T;
  /** 목업 테이블 이름. 기본값은 table입니다. (테스트에서 따로 씀) */
  mockKey?: string;
  /** 기본 키 컬럼 (Supabase) */
  keyColumn: keyof TableRow<T> & string;
  /** 모델에서 기본 키 값 */
  keyOf: (model: M) => string;
  /** Supabase를 쓰지 않을 때의 시드 데이터 */
  seed: readonly M[];
  /** 모델 → 행. 생성된 DB 타입으로 컬럼 이름과 필수 값을 검사합니다. */
  toRow: (model: M) => TableInsert<T>;
  /** 행 → 모델 */
  fromRow: (row: TableRow<T>) => M;
};

type Result<D> = PromiseLike<{ data: D; error: { code?: string; message: string } | null }>;
type Filtered = { select: (columns: string) => Result<unknown[]> };

/**
 * 제네릭 테이블을 다루기 위한 최소한의 쿼리 타입
 * 테이블 이름이 제네릭이라 supabase-js가 행 타입을 좁히지 못합니다.
 * 행 타입은 config의 toRow·fromRow에서 검사하고, 쿼리는 이 넓은 타입으로 다룹니다.
 */
type LooseQuery = {
  select: (columns: string) => Result<unknown[]> & {
    eq: (column: string, value: string) => { maybeSingle: () => Result<unknown> };
  };
  insert: (row: unknown) => Result<null>;
  update: (row: unknown) => { eq: (column: string, value: string) => Filtered };
  delete: () => { eq: (column: string, value: string) => Filtered };
};

/** Postgres 고유 키 위반 */
const UNIQUE_VIOLATION = "23505";

/**
 * 엔티티 저장소
 * Supabase 환경 변수가 있으면 Supabase 테이블을, 없으면 메모리 목업 테이블을 씁니다.
 * (CI·E2E는 목업으로 외부 의존 없이 돕니다)
 */
export function createRepository<T extends TableName, M>(
  config: RepositoryConfig<T, M>,
): Repository<M> {
  const { table, keyColumn, keyOf, seed, toRow, fromRow } = config;
  const mock = createMockTable<M>(config.mockKey ?? table, seed);
  const is = (key: string) => (model: M) => keyOf(model) === key;
  /** Supabase 쿼리. 연결하지 않았으면 null */
  const query = () => {
    const supabase = getSupabase();
    return supabase ? (supabase.from(table) as unknown as LooseQuery) : null;
  };

  return {
    async list() {
      const from = query();
      if (!from) return mock.list();
      const { data, error } = await from.select("*");
      if (error) throw new Error(`${table} 목록을 읽지 못했습니다: ${error.message}`);
      return (data as TableRow<T>[]).map(fromRow);
    },
    async find(key) {
      const from = query();
      if (!from) return mock.find(is(key)) ?? null;
      const { data, error } = await from.select("*").eq(keyColumn, key).maybeSingle();
      if (error) throw new Error(`${table}에서 ${key}를 읽지 못했습니다: ${error.message}`);
      return data ? fromRow(data as TableRow<T>) : null;
    },
    async insert(model) {
      const from = query();
      if (!from) {
        if (mock.find(is(keyOf(model)))) return "duplicate";
        return mock.insert(model);
      }
      const { error } = await from.insert(toRow(model));
      if (error?.code === UNIQUE_VIOLATION) return "duplicate";
      if (error) throw new Error(`${table}에 저장하지 못했습니다: ${error.message}`);
      return model;
    },
    async update(key, model) {
      const from = query();
      if (!from) return mock.update(is(key), model) ?? null;
      const { data, error } = await from.update(toRow(model)).eq(keyColumn, key).select(keyColumn);
      if (error) throw new Error(`${table}의 ${key}를 고치지 못했습니다: ${error.message}`);
      return data.length > 0 ? model : null;
    },
    async remove(key) {
      const from = query();
      if (!from) return mock.remove(is(key));
      const { data, error } = await from.delete().eq(keyColumn, key).select(keyColumn);
      if (error) throw new Error(`${table}의 ${key}를 지우지 못했습니다: ${error.message}`);
      return data.length > 0;
    },
  };
}
