import { createMockTable } from "./mock-table";
import { getSupabase } from "./supabase.server";

import "server-only";

type Row = Record<string, unknown>;

export type Repository<M> = {
  list: () => Promise<M[]>;
  find: (key: string) => Promise<M | null>;
  /** 같은 키가 이미 있으면 "duplicate" */
  insert: (model: M) => Promise<M | "duplicate">;
  update: (key: string, model: M) => Promise<M | null>;
  remove: (key: string) => Promise<boolean>;
};

type RepositoryConfig<M> = {
  /** Supabase 테이블 이름. 목업 테이블 이름으로도 씁니다. */
  table: string;
  /** 기본 키 컬럼 (Supabase) */
  keyColumn: string;
  /** 모델에서 기본 키 값 */
  keyOf: (model: M) => string;
  /** Supabase를 쓰지 않을 때의 시드 데이터 */
  seed: readonly M[];
  toRow: (model: M) => Row;
  fromRow: (row: Row) => M;
};

/** Postgres 고유 키 위반 */
const UNIQUE_VIOLATION = "23505";

/**
 * 엔티티 저장소
 * Supabase 환경 변수가 있으면 Supabase 테이블을, 없으면 메모리 목업 테이블을 씁니다.
 * (CI·E2E는 목업으로 외부 의존 없이 돕니다)
 */
export function createRepository<M>(config: RepositoryConfig<M>): Repository<M> {
  const { table, keyColumn, keyOf, seed, toRow, fromRow } = config;
  const mock = createMockTable<M>(table, seed);
  const is = (key: string) => (model: M) => keyOf(model) === key;

  return {
    async list() {
      const supabase = getSupabase();
      if (!supabase) return mock.list();
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw new Error(`${table} 목록을 읽지 못했습니다: ${error.message}`);
      return (data as Row[]).map(fromRow);
    },
    async find(key) {
      const supabase = getSupabase();
      if (!supabase) return mock.find(is(key)) ?? null;
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(keyColumn, key)
        .maybeSingle();
      if (error) throw new Error(`${table}에서 ${key}를 읽지 못했습니다: ${error.message}`);
      return data ? fromRow(data as Row) : null;
    },
    async insert(model) {
      const supabase = getSupabase();
      if (!supabase) {
        if (mock.find(is(keyOf(model)))) return "duplicate";
        return mock.insert(model);
      }
      const { error } = await supabase.from(table).insert(toRow(model));
      if (error?.code === UNIQUE_VIOLATION) return "duplicate";
      if (error) throw new Error(`${table}에 저장하지 못했습니다: ${error.message}`);
      return model;
    },
    async update(key, model) {
      const supabase = getSupabase();
      if (!supabase) return mock.update(is(key), model) ?? null;
      const { data, error } = await supabase
        .from(table)
        .update(toRow(model))
        .eq(keyColumn, key)
        .select(keyColumn);
      if (error) throw new Error(`${table}의 ${key}를 고치지 못했습니다: ${error.message}`);
      return data.length > 0 ? model : null;
    },
    async remove(key) {
      const supabase = getSupabase();
      if (!supabase) return mock.remove(is(key));
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq(keyColumn, key)
        .select(keyColumn);
      if (error) throw new Error(`${table}의 ${key}를 지우지 못했습니다: ${error.message}`);
      return data.length > 0;
    },
  };
}
