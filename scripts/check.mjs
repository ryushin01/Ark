#!/usr/bin/env node
/**
 * CI와 같은 검사를 한 명령으로 돌립니다 (pnpm check).
 * CI(.github/workflows/ci.yml)는 작업마다 이 스크립트의 묶음 하나를 부릅니다. 검사 목록은 여기 한 곳에서만 고칩니다.
 *
 *   pnpm check                 모든 묶음을 차례로 (static → build → e2e → vitals → visual → lighthouse)
 *   pnpm check static build    고른 묶음만
 *   pnpm check e2e -- --project=chromium --shard=1/2   e2e 묶음에 Playwright 인수 넘기기
 *
 * - visual은 기준 이미지가 Linux 것이라 macOS에서는 테스트가 스스로 건너뜁니다(e2e/visual.spec.ts).
 * - lighthouse는 CI가 아니면 결과를 공개 저장소에 올리지 않고 파일로만 남깁니다(.lighthouseci).
 * - 걸린 시간을 묶음·단계별로 보여 주고, CI에서는 작업 요약($GITHUB_STEP_SUMMARY)에도 적습니다.
 */
import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const isCI = Boolean(process.env.CI);

/** @type {Record<string, (extra: string[]) => string[][]>} */
const GROUPS = {
  static: () => [
    ["lint"],
    ["lint:fsd"],
    ["format:check"],
    ["typecheck"],
    ["test:coverage"],
    ["coverage:summary"],
  ],
  build: () => [["test:storybook"], ["build"], ["size"]],
  e2e: (extra) => (extra.length > 0 ? [["exec", "playwright", "test", ...extra]] : [["test:e2e"]]),
  vitals: () => [["test:vitals"]],
  visual: () => [["test:visual"]],
  lighthouse: () => [isCI ? ["lhci"] : ["lhci", "--upload.target=filesystem"]],
};

const ORDER = Object.keys(GROUPS);

const separator = process.argv.indexOf("--");
const names = process.argv.slice(2, separator === -1 ? undefined : separator);
const extra = separator === -1 ? [] : process.argv.slice(separator + 1);
const selected = names.length > 0 ? names : ORDER;

const unknown = selected.filter((name) => !(name in GROUPS));
if (unknown.length > 0) {
  console.error(`알 수 없는 묶음: ${unknown.join(", ")} (가능: ${ORDER.join(", ")})`);
  process.exit(2);
}

/** @type {{ step: string; seconds: number; ok: boolean }[]} */
const timings = [];

function report() {
  const rows = timings.map(
    ({ step, seconds, ok }) =>
      `| ${ok ? "통과" : "실패"} | \`${step}\` | ${seconds.toFixed(1)}초 |`,
  );
  const table = ["| 결과 | 단계 | 시간 |", "| --- | --- | --- |", ...rows].join("\n");
  console.log(`\n${table}\n`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### 검사 단계 (pnpm check ${selected.join(" ")})\n\n${table}\n\n`,
    );
  }
}

for (const name of selected) {
  for (const args of GROUPS[name](name === "e2e" ? extra : [])) {
    const command = args[0] === "exec" ? args : ["run", ...args];
    const step = `pnpm ${command.join(" ")}`;
    console.log(`\n▶ [${name}] ${step}`);
    const started = performance.now();
    const result = spawnSync("pnpm", command, { stdio: "inherit" });
    const ok = result.status === 0;
    timings.push({ step, seconds: (performance.now() - started) / 1000, ok });
    if (!ok) {
      report();
      console.error(`\n✘ [${name}] ${step} 실패`);
      process.exit(result.status ?? 1);
    }
  }
}

report();
console.log(`✔ pnpm check ${selected.join(" ")} 통과`);
