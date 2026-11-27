import { expect, test } from "@playwright/test";

import { expectNoAxeViolations } from "./support/axe";

/**
 * 상태별 접근성 검사 (axe, WCAG 2.2 AA)
 * 화면을 처음 연 모습만이 아니라, 사용자가 조작한 뒤의 상태(대화상자 열림, 필터·검색 결과, 결과 없음,
 * 오류 안내)에서도 위반이 없는지 봅니다. 처음 연 모습은 site.spec.ts·all-pages.spec.ts·offline.spec.ts가 검사합니다.
 * 저장 데이터를 바꾸지 않는 상태만 다룹니다(어드민 저장 흐름은 admin.spec.ts).
 */
test.use({ reducedMotion: "reduce" });

const searchbox = "이름·별칭·영역·유물로 찾기";

test("홈: 대륙 필터를 고른 상태", async ({ page }) => {
  await page.goto("/");
  const asia = page.getByRole("group", { name: "대륙으로 거르기" }).getByRole("button", {
    name: /^아시아/,
  });
  await asia.click();
  await expect(asia).toHaveAttribute("aria-pressed", "true");
  await expectNoAxeViolations(page);
});

test("작은 화면: 메뉴 대화상자를 연 상태", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/figures/zeus");
  await page.getByRole("button", { name: "메뉴" }).click();
  await expect(page.getByRole("dialog", { name: "메뉴" })).toBeVisible();
  await expectNoAxeViolations(page);
});

test("신 찾기: 검색과 분류 필터를 적용한 상태", async ({ page }) => {
  await page.goto("/figures");
  await page.getByRole("searchbox", { name: searchbox }).fill("바다");
  await page
    .getByRole("group", { name: "분류로 거르기" })
    .getByRole("button", { name: /^신/ })
    .click();
  await expect(page.getByText(/^신과 인물 \d+명$/)).toBeVisible();
  await expectNoAxeViolations(page);
});

test("신 찾기: 결과가 없는 상태", async ({ page }) => {
  await page.goto("/figures");
  await page.getByRole("searchbox", { name: searchbox }).fill("존재하지않는이름zzz");
  await expect(
    page.getByRole("group", { name: "대륙으로 거르기" }).getByRole("button", { name: "전체 0" }),
  ).toBeVisible();
  await expectNoAxeViolations(page);
});

test("비밀 전시실: 전시 목록 대화상자를 연 상태", async ({ page }) => {
  await page.goto("/vault");
  await page.getByRole("button", { name: "전시 목록" }).click();
  await expect(page.getByRole("dialog", { name: /전시 목록/ })).toBeVisible();
  await expectNoAxeViolations(page);
});

test("화면 설정: 주석·움직임을 끈 상태", async ({ page }) => {
  await page.goto("/figures/odin");
  await page.getByRole("button", { name: "주석" }).click();
  await page.getByRole("button", { name: "움직임" }).click();
  await expect(page.getByRole("button", { name: "움직임" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expectNoAxeViolations(page);
});

test("어드민 로그인: 비밀번호를 비우고 낸 오류 상태", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByLabel("관리자 비밀번호")).toHaveAttribute("aria-invalid", "true");
  await expectNoAxeViolations(page, { skipContrast: true });
});

test("어드민: 데모 계정 저장이 막힌 오류 안내 상태", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "데모 계정으로 둘러보기" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "대시보드" })).toBeVisible();
  await page.goto("/admin/figures/zeus");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "데모 계정은 둘러보기만 할 수 있어" }),
  ).toBeVisible();
  await expectNoAxeViolations(page, { skipContrast: true });
});
