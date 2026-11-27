import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** WCAG 2.2 AA까지의 axe 규칙 */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * 지금 화면(열린 대화상자·오류 안내 같은 상태 포함)에 axe 위반이 없는지 봅니다.
 * content-visibility로 미룬 항목도 검사하도록 모두 그립니다.
 * 1.7.0 어드민 디자인 개편은 사용자 지시로 글자 대비를 검사하지 않습니다(skipContrast, 어드민 화면에서만).
 */
export async function expectNoAxeViolations(page: Page, { skipContrast = false } = {}) {
  await page.addStyleTag({ content: "* { content-visibility: visible !important; }" });
  const builder = new AxeBuilder({ page }).withTags(TAGS);
  const results = await (
    skipContrast ? builder.disableRules(["color-contrast"]) : builder
  ).analyze();
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}
