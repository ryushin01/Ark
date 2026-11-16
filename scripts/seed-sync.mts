/**
 * 두 커밋 사이에 코드(목업 데이터)에서 바뀐 콘텐츠만 운영 DB에 넣는 SQL을 만듭니다.
 * 실행: tsx scripts/seed-sync.mts <이전 커밋의 작업 트리> > sync.sql
 *       tsx scripts/seed-sync.mts --all > sync.sql  (모든 행을 코드 값으로 덮어씀. CI에서 SQL 검사용)
 *
 * - 새로 생겼거나 값이 바뀐 행만 upsert합니다. 바뀌지 않은 행은 건드리지 않으므로, 어드민에서 고친 행은 그대로 남습니다.
 * - 코드에서 사라진 행은 지우지 않고 표준 오류로 알리기만 합니다. (지우는 일은 어드민에서)
 * - 바뀐 것이 없으면 아무것도 출력하지 않습니다.
 */
import { pathToFileURL } from "node:url";

import { buildRows, type SeedRows, type TableName, TABLES } from "./seed/rows.mjs";
import { diffRows, transactionSql } from "./seed/sql.mjs";

const baseDir = process.argv[2];
if (!baseDir) {
  console.error("사용법: tsx scripts/seed-sync.mts <이전 커밋의 작업 트리 | --all>");
  process.exit(2);
}

const empty = Object.fromEntries(
  Object.keys(TABLES).map((table) => [table, []]),
) as unknown as SeedRows;
const base =
  baseDir === "--all" ? empty : await buildRows(pathToFileURL(`${baseDir.replace(/\/$/, "")}/`));
const head = await buildRows();
const { changed, removed } = diffRows(base, head);

for (const [table, rows] of Object.entries(changed)) {
  console.error(`바뀐 행 ${table}: ${rows.length}개`);
}
for (const [table, keys] of Object.entries(removed) as [TableName, string[]][]) {
  console.error(`코드에서 사라진 행 ${table}: ${keys.join(", ")} (운영 DB에서는 지우지 않음)`);
}

process.stdout.write(transactionSql(changed, "update"));
