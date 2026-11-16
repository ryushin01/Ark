import { type SeedRows, type TableName, TABLES } from "./rows.mjs";

/**
 * 행을 한 번에 넣는 SQL
 * - skip: 이미 있는 행은 건너뜁니다. (seed.sql, 빈 DB 채우기)
 * - update: 이미 있는 행은 코드의 값으로 바꿉니다. (seed-sync, 코드에서 바뀐 행만 넘겨 받음)
 */
export function upsertSql(
  table: TableName,
  rows: Record<string, unknown>[],
  mode: "skip" | "update",
) {
  if (rows.length === 0) return "";
  const key = TABLES[table];
  const columns = Object.keys(rows[0]);
  const json = JSON.stringify(rows);
  if (json.includes("$seed$"))
    throw new Error("데이터에 $seed$가 들어 있어 SQL을 만들 수 없습니다.");
  const list = columns.join(", ");
  const conflict =
    mode === "skip"
      ? "do nothing"
      : `do update set ${columns
          .filter((column) => column !== key)
          .map((column) => `${column} = excluded.${column}`)
          .join(", ")}`;
  return `insert into public.${table} (${list})
select ${list} from jsonb_populate_recordset(null::public.${table}, $seed$${json}$seed$::jsonb)
on conflict (${key}) ${conflict};`;
}

/** 여러 테이블을 한 트랜잭션으로. 계열과 자료가 서로를 가리키므로 외래 키 검사는 커밋 때 합니다. */
export function transactionSql(rows: Partial<SeedRows>, mode: "skip" | "update") {
  const statements = (Object.keys(TABLES) as TableName[])
    .map((table) => upsertSql(table, rows[table] ?? [], mode))
    .filter(Boolean);
  if (statements.length === 0) return "";
  return `begin;
set constraints all deferred;
${statements.join("\n")}
commit;
`;
}

/** 두 시점의 행을 비교해, 새로 생겼거나 값이 바뀐 행과 코드에서 사라진 행의 키를 돌려줍니다. */
export function diffRows(base: SeedRows, head: SeedRows) {
  const changed: Partial<SeedRows> = {};
  const removed: Partial<Record<TableName, string[]>> = {};
  for (const table of Object.keys(TABLES) as TableName[]) {
    const key = TABLES[table];
    const before = new Map(base[table].map((row) => [String(row[key]), JSON.stringify(row)]));
    const rows = head[table].filter((row) => before.get(String(row[key])) !== JSON.stringify(row));
    if (rows.length) changed[table] = rows;
    const now = new Set(head[table].map((row) => String(row[key])));
    const gone = [...before.keys()].filter((id) => !now.has(id));
    if (gone.length) removed[table] = gone;
  }
  return { changed, removed };
}
