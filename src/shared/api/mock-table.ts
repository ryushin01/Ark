/**
 * 메모리에 두는 목업 테이블
 * Supabase를 연결하기 전까지 쓰는 저장소입니다. 서버 프로세스가 다시 시작되면 시드 데이터로 돌아갑니다.
 * 개발 서버의 빠른 새로고침(HMR) 사이에도 같은 데이터를 쓰도록 globalThis에 둡니다.
 */
export type MockTable<T> = {
  list: () => T[];
  find: (predicate: (row: T) => boolean) => T | undefined;
  insert: (row: T) => T;
  update: (predicate: (row: T) => boolean, row: T) => T | undefined;
  remove: (predicate: (row: T) => boolean) => boolean;
  /** 테스트에서 시드 데이터로 되돌립니다. */
  reset: () => void;
};

const registry = globalThis as typeof globalThis & { __arkMockTables?: Map<string, unknown[]> };

export function createMockTable<T>(name: string, seed: readonly T[]): MockTable<T> {
  registry.__arkMockTables ??= new Map();
  const tables = registry.__arkMockTables;
  const rows = () => {
    if (!tables.has(name)) tables.set(name, structuredClone([...seed]));
    return tables.get(name) as T[];
  };

  return {
    list: () => structuredClone(rows()),
    find: (predicate) => {
      const row = rows().find(predicate);
      return row && structuredClone(row);
    },
    insert: (row) => {
      rows().push(structuredClone(row));
      return row;
    },
    update: (predicate, row) => {
      const table = rows();
      const index = table.findIndex(predicate);
      if (index < 0) return undefined;
      table[index] = structuredClone(row);
      return row;
    },
    remove: (predicate) => {
      const table = rows();
      const index = table.findIndex(predicate);
      if (index < 0) return false;
      table.splice(index, 1);
      return true;
    },
    reset: () => {
      tables.set(name, structuredClone([...seed]));
    },
  };
}
