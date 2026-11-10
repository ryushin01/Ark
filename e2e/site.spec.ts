import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { MOCK_FIGURES } from "../src/entities/figure/api/mock-data";

const PAGES = ["/", "/figures", "/pantheons/greek", "/figures/odin", "/figures/loki"];
const WIDTHS = [375, 768, 1440];

/** 등장 애니메이션을 끄고 검사합니다. (사용자가 동작 줄이기를 켠 상태와 같습니다) */
test.use({ reducedMotion: "reduce" });

async function hasHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

for (const path of PAGES) {
  test(`${path}: 접근성 위반이 없습니다 (axe, WCAG 2.2 AA)`, async ({ page }) => {
    await page.goto(path);
    // content-visibility로 미룬 항목도 검사하도록 모두 그립니다.
    await page.addStyleTag({ content: "* { content-visibility: visible !important; }" });
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
  await expect(timeline).toHaveCount(49);
  await expect(timeline.first()).toContainText("이집트 신화");
  await expect(timeline.last()).toContainText("도곤 신화");
});

test("홈: 대륙 버튼으로 신화 계열을 거릅니다", async ({ page }) => {
  await page.goto("/");
  const filters = page.getByRole("group", { name: "대륙으로 거르기" });
  const africa = filters.getByRole("button", { name: /^아프리카/ });
  await africa.click();
  await expect(africa).toHaveAttribute("aria-pressed", "true");
  const timeline = page.locator("#pantheons ol > li");
  await expect(timeline).toHaveCount(4);
  await expect(timeline.first()).toContainText("이집트 신화");
  await filters.getByRole("button", { name: /^전체/ }).click();
  await expect(timeline).toHaveCount(49);
});

test("신 찾기: 영역으로 찾고 대륙으로 거른 뒤 신 화면으로 이동합니다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "메뉴" }).click();
  await page.getByRole("dialog", { name: "메뉴" }).getByRole("link", { name: "찾기" }).click();
  await expect(page).toHaveURL(/\/figures$/);
  await expect(page.getByRole("heading", { level: 1, name: "신 찾기" })).toBeVisible();

  // 앞 화면(홈)의 신 색인은 Next.js가 숨긴 채 남겨 두므로 보이는 링크만 셉니다.
  const cards = page.locator('a[href^="/figures/"]').filter({ visible: true });
  await expect(cards).toHaveCount(MOCK_FIGURES.length);
  await page.getByRole("searchbox", { name: "이름·별칭·영역으로 찾기" }).fill("천둥");
  await expect(page.getByText(/^신과 인물 \d+명$/)).toBeVisible();
  await page.getByRole("button", { name: /^아프리카/ }).click();
  await expect(cards).toHaveCount(1);
  await cards.first().click();
  await expect(page).toHaveURL(/\/figures\/shango$/);
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

test("분류: 신 상세에 분류를 보여 주고, 신 찾기에서 분류로 거릅니다", async ({ page }) => {
  await page.goto("/figures/heracles");
  await expect(page.getByText("Heracles · 영웅")).toBeVisible();

  await page.goto("/figures");
  const kinds = page.getByRole("group", { name: "분류로 거르기" });
  await kinds.getByRole("button", { name: /^영웅/ }).click();
  await page.getByRole("searchbox", { name: "이름·별칭·영역으로 찾기" }).fill("고구려");
  const cards = page.locator('a[href^="/figures/"]').filter({ visible: true });
  await expect(cards).toHaveCount(2);
  await expect(cards.filter({ hasText: "동명성왕" })).toHaveCount(1);
  await expect(cards.filter({ hasText: "유화" })).toHaveCount(1);
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

test("화면 설정: 주석과 움직임을 끄면 다시 들어와도 유지됩니다", async ({ page }) => {
  await page.goto("/figures/zeus");
  const annotations = page.getByRole("button", { name: "주석" });
  await expect(annotations).toHaveAttribute("aria-pressed", "true");
  await annotations.click();
  await expect(annotations).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("html")).toHaveAttribute("data-annotations", "off");
  await page.getByRole("button", { name: "움직임" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-annotations", "off");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  await expect(page.getByRole("button", { name: "주석" })).toHaveAttribute("aria-pressed", "false");
});

test.describe("악보 무대", () => {
  test.use({ reducedMotion: "no-preference" });

  test("스크롤하면 재생선의 계열이 바뀝니다", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /계열 보기$/ });
    await expect(link).toHaveAttribute("href", "/pantheons/egyptian");
    await page.evaluate(() => {
      const section = document.querySelector("section")!;
      window.scrollTo(0, section.offsetHeight - window.innerHeight);
    });
    await expect(link).toHaveAttribute("href", "/pantheons/dogon");
  });

  test("키보드로 필름의 링크에 들어오면 그 계열까지 스크롤합니다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "인도 신화" }).first().focus();
    await expect(page.getByRole("link", { name: /계열 보기$/ })).toHaveAttribute(
      "href",
      "/pantheons/hindu",
    );
  });
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

test.describe("화면 전환", () => {
  // 이 파일은 기본으로 동작 줄이기를 켜 두므로(위 test.use), 전환을 보려면 끕니다.
  test.use({ reducedMotion: "no-preference" });

  /** 겹쳐 있는 화면(라우트 경계) 수의 최댓값을 기록합니다. 전환 중에는 떠나는 화면과 들어오는 화면이 함께 있습니다. */
  async function trackOverlap(page: Page) {
    await page.evaluate(() => {
      const w = window as unknown as { __maxPages: number };
      w.__maxPages = 0;
      const tick = () => {
        w.__maxPages = Math.max(
          w.__maxPages,
          document.querySelectorAll("[data-ssgoi-transition]").length,
        );
        requestAnimationFrame(tick);
      };
      tick();
    });
  }
  const maxPages = (page: Page) =>
    page.evaluate(() => (window as unknown as { __maxPages: number }).__maxPages);

  /** 신 목록에서 index번째 신을 엽니다. 누르기 전 목록의 스크롤 위치를 돌려줍니다. */
  async function openFigure(page: Page, index = 0) {
    await page.goto("/figures");
    const link = page.locator('main a[href^="/figures/"]').nth(index);
    const href = await link.getAttribute("href");
    await link.scrollIntoViewIfNeeded();
    const listScroll = await page.evaluate(() => window.scrollY);
    await trackOverlap(page);
    await link.click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator("[data-ssgoi-transition]")).toHaveCount(1);
    await expect(page.locator("[data-ssgoi-transition]")).toHaveAttribute(
      "data-ssgoi-transition",
      href!,
    );
    return listScroll;
  }

  test("신 목록에서 신 화면으로 들어가면 두 화면이 겹쳐 움직이고, 새 화면은 맨 위에서 시작한다", async ({
    page,
  }) => {
    const listScroll = await openFigure(page, 8);
    expect(listScroll).toBeGreaterThan(0);
    expect(await maxPages(page)).toBe(2);
    // 새 화면은 맨 위에서 시작합니다.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    // cacheComponents가 이전 화면을 숨겨 두는 탓에 뒤로 갔을 때 보던 자리 복원은 보장되지 않습니다(docs 참고).
    await page.goBack();
    await expect(page).toHaveURL("/figures");
    await expect(page.locator("[data-ssgoi-transition]")).toHaveCount(1);
  });

  test("동작 줄이기를 켜면 화면 전환 없이 바로 바뀐다", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openFigure(page);
    expect(await maxPages(page)).toBe(1);
  });
});
