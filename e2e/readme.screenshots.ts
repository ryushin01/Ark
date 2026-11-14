import { type Page, test } from "@playwright/test";

/**
 * README 스크린샷 촬영 (pnpm screenshots, 먼저 pnpm build)
 * 결과: docs/images/*.jpg. 화면의 데이터는 모두 공개 자료와 목업 데이터입니다.
 */
const shoot = (page: Page, name: string) =>
  page.screenshot({ path: `docs/images/${name}.jpg`, type: "jpeg", quality: 80 });

async function scrollTo(page: Page, selector: string, offset = 0) {
  await page.evaluate(
    ([target, extra]) => {
      const element = document.querySelector(target as string);
      if (element)
        window.scrollTo(
          0,
          element.getBoundingClientRect().top + window.scrollY + (extra as number),
        );
    },
    [selector, offset],
  );
  await page.waitForTimeout(2000);
}

test.describe("데스크톱", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("홈", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.2));
    await page.waitForTimeout(2000);
    await shoot(page, "home-hero");
    await scrollTo(page, "#pantheons", 330);
    await shoot(page, "home-timeline");
    await scrollTo(page, "#figures", -40);
    await page.getByRole("link", { name: /^오딘/ }).hover();
    await page.waitForTimeout(1200);
    await shoot(page, "home-index");
  });

  test("계열과 신", async ({ page }) => {
    await page.goto("/pantheons/greek", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shoot(page, "pantheon");
    await page.goto("/figures/thor", { waitUntil: "networkidle" });
    await scrollTo(page, "#exhibits-title", -40);
    await shoot(page, "figure");
    await page.goto("/figures", { waitUntil: "networkidle" });
    await page.getByRole("searchbox").fill("바다");
    await page.waitForTimeout(1500);
    await shoot(page, "search");
  });
});

test.describe("비밀 전시실", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("진열장과 유물 상세", async ({ page }) => {
    await page.goto("/vault", { waitUntil: "networkidle" });
    await scrollTo(page, "#shield-of-achilles", 40);
    await shoot(page, "vault");
    await page.goto("/vault/mjolnir", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shoot(page, "relic");
  });
});

test.describe("어드민", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("대시보드와 편집", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: "데모 계정으로 둘러보기" }).click();
    await page.getByRole("heading", { level: 1, name: "대시보드" }).waitFor();
    await shoot(page, "admin-dashboard");
    await page.goto("/admin/figures/odin");
    await page.getByRole("heading", { level: 1 }).waitFor();
    await shoot(page, "admin-figure");
  });
});

test.describe("모바일", () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

  test("홈과 메뉴", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shoot(page, "mobile-home");
    await page.goto("/figures/amaterasu", { waitUntil: "networkidle" });
    await scrollTo(page, "#exhibits-title", -60);
    await shoot(page, "mobile-figure");
  });
});
