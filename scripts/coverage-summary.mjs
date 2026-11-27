#!/usr/bin/env node
/**
 * 커버리지 표 (pnpm coverage:summary, pnpm check static의 마지막 단계)
 * Vitest가 만든 coverage/coverage-summary.json을 읽어 전체와 로직 계층(shared/lib, model, api)의
 * 줄·문·함수·분기 비율을 Markdown 표로 냅니다. CI에서는 작업 요약($GITHUB_STEP_SUMMARY)에도 적습니다.
 */
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";

const METRICS = /** @type {const} */ (["lines", "statements", "functions", "branches"]);

/** 표에 보여 줄 묶음. vitest.config.mts의 coverage.thresholds와 같은 범위입니다. */
const GROUPS = [
  { name: "shared/lib", test: (file) => file.startsWith("shared/lib/") },
  {
    name: "슬라이스 model",
    test: (file) => /^(_pages|widgets|features|entities)\/.+\/model\//.test(file),
  },
  {
    name: "슬라이스 api",
    test: (file) => /^(_pages|widgets|features|entities|shared)\/(.+\/)?api\//.test(file),
  },
];

const summaryPath = path.join(process.cwd(), "coverage", "coverage-summary.json");
/** @type {Record<string, Record<string, { total: number; covered: number }>>} */
const summary = JSON.parse(readFileSync(summaryPath, "utf8"));

const empty = () => Object.fromEntries(METRICS.map((metric) => [metric, { total: 0, covered: 0 }]));
const sums = Object.fromEntries(GROUPS.map((group) => [group.name, empty()]));

for (const [file, values] of Object.entries(summary)) {
  if (file === "total") continue;
  const relative = file.split(`${path.sep}src${path.sep}`).pop()?.split(path.sep).join("/") ?? "";
  for (const group of GROUPS) {
    if (!group.test(relative)) continue;
    for (const metric of METRICS) {
      sums[group.name][metric].total += values[metric].total;
      sums[group.name][metric].covered += values[metric].covered;
    }
  }
}

const percent = ({ total, covered }) =>
  total === 0 ? "-" : `${((covered / total) * 100).toFixed(1)}%`;
const row = (name, values) =>
  `| ${name} | ${METRICS.map((metric) => percent(values[metric])).join(" | ")} |`;

const table = [
  "| 범위 | 줄 | 문 | 함수 | 분기 |",
  "| --- | --- | --- | --- | --- |",
  row("전체", summary.total),
  ...GROUPS.map((group) => row(group.name, sums[group.name])),
].join("\n");

console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### 커버리지\n\n${table}\n\n로직 계층 기준 80%, 전체는 기준선(vitest.config.mts) 아래로 내려가지 않습니다.\n\n`,
  );
}
