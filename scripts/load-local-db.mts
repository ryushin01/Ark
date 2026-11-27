/**
 * 로컬 Supabase 부하 측정 (pnpm load:local-db)
 * 공개 화면이 읽는 테이블을 동시에 여러 번 읽어 응답 시간(p50·p95·최대)을 잽니다.
 * 운영 DB에 부하를 주지 않도록 SUPABASE_URL이 이 컴퓨터(127.0.0.1·localhost)일 때만 돌고, 아니면 바로 멈춥니다.
 * CI의 upload 작업(로컬 Supabase)에서도 돌려 결과를 작업 요약에 적습니다. 읽기 오류가 하나라도 나면 실패합니다.
 *
 *   SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SECRET_KEY=... pnpm load:local-db [동시 요청 수=20] [반복=5]
 */
import { createClient } from "@supabase/supabase-js";
import { appendFileSync } from "node:fs";
import { z } from "zod";

const env = z
  .object({
    SUPABASE_URL: z.url(),
    SUPABASE_SECRET_KEY: z.string().min(1),
  })
  .parse(process.env);

const { hostname } = new URL(env.SUPABASE_URL);
if (hostname !== "127.0.0.1" && hostname !== "localhost") {
  console.error(`로컬 Supabase가 아닙니다(${hostname}). 운영 DB에는 부하를 주지 않습니다.`);
  process.exit(2);
}

const concurrency = z.coerce
  .number()
  .int()
  .positive()
  .max(100)
  .parse(process.argv[2] ?? 20);
const rounds = z.coerce
  .number()
  .int()
  .positive()
  .max(50)
  .parse(process.argv[3] ?? 5);

const TABLES = ["pantheons", "figures", "exhibits", "relics", "genealogies", "works"] as const;

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const quantile = (sorted: number[], q: number) =>
  sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0;

const rows: string[] = [];
let failures = 0;

for (const table of TABLES) {
  const durations: number[] = [];
  for (let round = 0; round < rounds; round += 1) {
    await Promise.all(
      Array.from({ length: concurrency }, async () => {
        const started = performance.now();
        const { error } = await supabase.from(table).select("*");
        durations.push(performance.now() - started);
        if (error) {
          failures += 1;
          console.error(`${table}: ${error.message}`);
        }
      }),
    );
  }
  durations.sort((a, b) => a - b);
  rows.push(
    `| ${table} | ${durations.length} | ${quantile(durations, 0.5).toFixed(0)} | ${quantile(durations, 0.95).toFixed(0)} | ${(durations.at(-1) ?? 0).toFixed(0)} |`,
  );
}

const report = [
  `동시 ${concurrency}개 × ${rounds}번, 전체 행 읽기(select *)`,
  "",
  "| 테이블 | 요청 | p50(ms) | p95(ms) | 최대(ms) |",
  "| --- | --- | --- | --- | --- |",
  ...rows,
].join("\n");

console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### 로컬 Supabase 부하\n\n${report}\n\n`);
}
if (failures > 0) {
  console.error(`읽기 오류 ${failures}건`);
  process.exit(1);
}
