// @vitest-environment node
import { describe, expect, it } from "vitest";

import { changelogEntries, summarize, toPlainText } from "./changelog";

const MARKDOWN = `# 버전 기록

## 1.7.1 - 2026-11-23

- 수정: 운영 첫 화면 그림이 \`/_next/image\` 402로 깨지던 문제를 고침

## 1.7.0 - 2026-11-22

어드민 디자인을 [레퍼런스](https://example.test)의 구성으로 다시 만듭니다.

- 색과 글꼴: **먹색** 글자
- 머리글: 로고

## 1.6.2 - 2026-11-20

- 수정: 인물 표기를 바로잡음
`;

async function collect(markdown: string, limit = Infinity) {
  const entries = [];
  for await (const entry of changelogEntries(markdown)) {
    entries.push(entry);
    if (entries.length >= limit) break;
  }
  return entries;
}

describe("changelogEntries", () => {
  it("버전 절을 위에서부터 하나씩 돌려줍니다", async () => {
    const entries = await collect(MARKDOWN);
    expect(entries.map((entry) => entry.version)).toEqual(["1.7.1", "1.7.0", "1.6.2"]);
    expect(entries.map((entry) => entry.date)).toEqual(["2026-11-23", "2026-11-22", "2026-11-20"]);
  });

  it("절 안의 줄을 본문으로 담고 빈 줄은 뺍니다", async () => {
    const [first, second] = await collect(MARKDOWN);
    expect(first?.lines).toEqual([
      "- 수정: 운영 첫 화면 그림이 `/_next/image` 402로 깨지던 문제를 고침",
    ]);
    expect(second?.lines).toHaveLength(3);
  });

  it("필요한 만큼만 읽고 멈출 수 있습니다", async () => {
    const entries = await collect(MARKDOWN, 2);
    expect(entries).toHaveLength(2);
  });

  it("버전 제목이 아닌 ## 줄은 건너뜁니다", async () => {
    const entries = await collect("## 개요\n\n내용\n\n## 2.0.0 - 2026-01-01\n\n- 새 기능\n");
    expect(entries.map((entry) => entry.version)).toEqual(["2.0.0"]);
  });
});

describe("toPlainText", () => {
  it("목록 기호와 마크다운 서식을 지웁니다", () => {
    expect(toPlainText("- 색: **먹색** 글자와 `code` 그리고 [링크](https://x.test)")).toBe(
      "색: 먹색 글자와 code 그리고 링크",
    );
  });
});

describe("summarize", () => {
  it("첫 줄을 제목용 한 줄로 줄입니다", () => {
    const long = "- 수정: " + "가".repeat(200);
    const summary = summarize([long]);
    expect(summary.length).toBeLessThanOrEqual(61);
    expect(summary.endsWith("…")).toBe(true);
  });

  it("줄이 없으면 빈 문자열입니다", () => {
    expect(summarize([])).toBe("");
  });
});
