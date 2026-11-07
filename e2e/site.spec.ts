import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const PAGES = ["/", "/pantheons/greek", "/figures/odin", "/figures/loki"];
const WIDTHS = [375, 768, 1440];

/** 등장 애니메이션을 끄고 검사합니다. (사용자가 동작 줄이기를 켠 상태와 같습니다) */
test.use({ reducedMotion: "reduce" });

async function hasHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

for (const path of PAGES) {
  test(`${path}: 접근성 위반이 없습니다 (axe, WCAG 2.2 AA)`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
  });

  for (const width of WIDTHS) {
    test(`${path}: ${width}px에서 가로로 넘치지 않습니다`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  }
}

test("홈: 신화 계열을 오래된 문헌 순서로 보여 줍니다", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Ark — 세계 신화 도서관" }),
  ).toBeAttached();
  const timeline = page.locator("#pantheons ol > li");
  await expect(timeline).toHaveCount(9);
  await expect(timeline.first()).toContainText("이집트 신화");
  await expect(timeline.last()).toContainText("아즈텍 신화");
});

test("홈 → 계열 → 신: 링크를 따라 상세 화면으로 이동합니다", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /그리스 신화/ })
    .first()
    .click();
  await expect(page).toHaveURL("/pantheons/greek");
  await expect(page.getByRole("heading", { level: 1, name: "그리스 신화" })).toBeVisible();

  await page.getByRole("link", { name: /^제우스/ }).click();
  await expect(page).toHaveURL("/figures/zeus");
  await expect(page.getByRole("heading", { level: 1, name: "제우스" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "현재 위치" })).toContainText("그리스 신화");
});

test("신 상세: 모든 자료 이미지에 대체 텍스트와 출처 링크가 있습니다", async ({ page }) => {
  await page.goto("/figures/odin");
  const figures = page.locator("#exhibits-title ~ ol figure");
  await expect(figures).toHaveCount(3);
  for (const figure of await figures.all()) {
    await expect(figure.locator("img")).toHaveAttribute("alt", /.+/);
    await expect(figure.getByRole("link", { name: "원본 출처" })).toHaveAttribute(
      "href",
      /commons\.wikimedia\.org/,
    );
  }
});

test("자료가 없는 신은 안내 문구를 보여 줍니다", async ({ page }) => {
  await page.goto("/figures/loki");
  await expect(page.getByText("아직 등록된 자료가 없습니다.")).toBeVisible();
});

test("본문 바로가기: 첫 Tab에 나타나고 누르면 본문으로 초점이 갑니다", async ({ page }) => {
  await page.goto("/figures/zeus");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "본문 바로가기" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("작은 화면 메뉴: 열고 Esc로 닫으면 초점이 메뉴 버튼으로 돌아옵니다", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/pantheons/norse");
  const menuButton = page.getByRole("button", { name: "메뉴" });
  await menuButton.click();
  const dialog = page.getByRole("dialog", { name: "메뉴" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "신들" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(menuButton).toBeFocused();
});

test("영향 아카이브는 기능 플래그가 꺼져 있으면 404이고 메뉴에도 없습니다", async ({ page }) => {
  const response = await page.goto("/archive");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "찾는 기록이 이 도서관에 없습니다." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "아카이브" })).toHaveCount(0);
});

test("보안 헤더가 있고, CSP가 화면의 리소스를 막지 않습니다", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
  });
  const response = await page.goto("/figures/odin");
  const headers = response?.headers() ?? {};
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");

  // 이미지를 끝까지 내려 모두 불러오게 한 뒤 확인합니다.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState("networkidle");
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(violations).toEqual([]);
});
