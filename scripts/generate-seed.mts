/**
 * 목업 데이터로 Supabase 시드 SQL을 만듭니다. 이미 있는 행은 건너뜁니다.
 * 실행: pnpm db:seed:generate → supabase/seed.sql
 */
import { writeFile } from "node:fs/promises";

import { buildRows } from "./seed/rows.mjs";
import { transactionSql } from "./seed/sql.mjs";

const rows = await buildRows();

await writeFile(
  new URL("../supabase/seed.sql", import.meta.url),
  `-- 자동 생성 파일입니다. 고치지 말고 pnpm db:seed:generate로 다시 만듭니다.\n${transactionSql(rows, "skip")}`,
);
console.log(
  `supabase/seed.sql: 계열 ${rows.pantheons.length}, 신 ${rows.figures.length}, 자료 ${rows.exhibits.length}, 작품 ${rows.works.length}, 계보 ${rows.genealogies.length}, 유물 ${rows.relics.length}`,
);
