import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { MOCK_FIGURES } from "../src/entities/figure/api/mock-data";
import { MOCK_PANTHEONS } from "../src/entities/pantheon/api/mock-data";
import { MOCK_RELICS } from "../src/entities/relic/api/mock-data";

/**
 * 모든 계열·신·유물 화면 검사
 * 데이터가 늘어도 대체 텍스트, 명도 대비, 가로 넘침 같은 문제를 자동으로 잡습니다.
 * (대표 화면의 자세한 검사는 site.spec.ts)
 */
const PATHS = [
  ...MOCK_PANTHEONS.map((pantheon) => `/pantheons/${pantheon.slug}`),
  ...MOCK_FIGURES.map((figure) => `/figures/${figure.slug}`),
  "/vault",
  ...MOCK_RELICS.map((relic) => `/vault/${relic.slug}`),
];

test.use({ reducedMotion: "reduce", viewport: { width: 375, height: 800 } });

for (const path of PATHS) {
  test(`${path}: 접근성 위반과 가로 넘침이 없습니다`, async ({ page }) => {
    await page.goto(path);
    // content-visibility로 미룬 항목도 검사하도록 모두 그립니다.
    await page.addStyleTag({ content: "* { content-visibility: visible !important; }" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
  });
}
