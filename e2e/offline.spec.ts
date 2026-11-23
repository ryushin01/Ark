import AxeBuilder from "@axe-core/playwright";
import { type BrowserContext, expect, type Page, test } from "@playwright/test";

import { MOCK_FIGURES } from "../src/entities/figure/api/mock-data";
import { MOCK_PANTHEONS } from "../src/entities/pantheon/api/mock-data";
import { MOCK_RELICS } from "../src/entities/relic/api/mock-data";

/**
 * 오프라인 검사 (pnpm test:e2e:offline, CI의 E2E에 포함)
 * 브라우저에서 localhost 밖으로 나가는 요청을 모두 막고, 비밀 값(.env) 없이 띄운 서버에서
 * 공개 사이트와 어드민의 주요 화면이 내용과 함께 뜨는지, 접근성 위반이 없는지 확인합니다.
 * - 기본 서버: Supabase 접속 정보 없음(메모리 목업)
 * - 대체 서버(OFFLINE_FALLBACK_URL): Supabase 주소는 있지만 닿지 않음(.invalid) → 내장 데이터로 대신
 */
test.use({ reducedMotion: "reduce" });

const FALLBACK_URL = process.env.OFFLINE_FALLBACK_URL;

const zeus = MOCK_FIGURES.find((figure) => figure.slug === "zeus");
const greek = MOCK_PANTHEONS.find((pantheon) => pantheon.slug === "greek");
const relic = MOCK_RELICS[0];

const PUBLIC_PAGES = [
  { path: "/", text: greek?.name ?? "그리스" },
  { path: "/figures", text: zeus?.name ?? "제우스" },
  { path: `/pantheons/${greek?.slug}`, text: zeus?.name ?? "제우스" },
  { path: `/figures/${zeus?.slug}`, text: zeus?.epithet ?? "" },
  { path: "/vault", text: relic?.name ?? "" },
  { path: `/vault/${relic?.slug}`, text: relic?.name ?? "" },
];

const ADMIN_PAGES = [
  { path: "/admin/pantheons", heading: "신화 계열" },
  { path: "/admin/figures", heading: "신·인물" },
  { path: "/admin/exhibits", heading: "소장 자료" },
  { path: "/admin/relics", heading: "유물" },
];

/** localhost 밖으로 나가는 요청을 막고, 막은 주소를 모읍니다. */
async function blockExternal(context: BrowserContext) {
  const blocked: string[] = [];
  await context.route("**/*", (route) => {
    const { hostname, protocol } = new URL(route.request().url());
    const local = hostname === "localhost" || hostname === "127.0.0.1";
    if (local || protocol === "data:" || protocol === "blob:") return route.continue();
    blocked.push(route.request().url());
    return route.abort("internetdisconnected");
  });
  return blocked;
}

async function expectNoAxeViolations(page: Page, { skipContrast = false } = {}) {
  // content-visibility로 미룬 항목도 검사하도록 모두 그립니다.
  await page.addStyleTag({ content: "* { content-visibility: visible !important; }" });
  const builder = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
    "wcag22aa",
  ]);
  // 1.7.0 어드민 디자인 개편은 사용자 지시로 글자 대비를 검사하지 않습니다(어드민 화면에서만).
  const results = await (
    skipContrast ? builder.disableRules(["color-contrast"]) : builder
  ).analyze();
  expect(results.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
}

/** 이미지가 모두 같은 출처에서 실제로 그려졌는지 (깨진 그림이 없는지) */
async function expectImagesLoaded(page: Page) {
  const broken = await page.locator("main img").evaluateAll((images) =>
    images
      .filter((image) => image instanceof HTMLImageElement)
      .filter((image) => image.loading !== "lazy" && image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
  );
  expect(broken).toEqual([]);
}

async function loginDemo(page: Page, baseURL = "") {
  await page.goto(`${baseURL}/admin/login`);
  await page.getByRole("button", { name: "데모 계정으로 둘러보기" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "대시보드" })).toBeVisible();
}

test.describe("비밀 값 없이(메모리 목업), 외부 요청을 막은 상태", () => {
  for (const { path, text } of PUBLIC_PAGES) {
    test(`${path}: 내용과 함께 뜨고 외부 요청이 없습니다`, async ({ page, context }) => {
      const blocked = await blockExternal(context);
      await page.goto(path);
      await expect(page.getByRole("main")).toContainText(text);
      await page.waitForLoadState("networkidle");
      await expectImagesLoaded(page);
      await expectNoAxeViolations(page);
      expect(blocked).toEqual([]);
    });
  }

  test("어드민: 데모 계정으로 모든 목록 화면이 뜹니다", async ({ page, context }) => {
    const blocked = await blockExternal(context);
    await loginDemo(page);
    // 대시보드: 항목마다 개수가 나옵니다.
    await expect(page.getByRole("link", { name: /신·인물 \d+/ })).toBeVisible();
    await expectNoAxeViolations(page, { skipContrast: true });
    for (const { path, heading } of ADMIN_PAGES) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page.getByRole("main").getByRole("row").nth(1)).toBeVisible();
      await expectNoAxeViolations(page, { skipContrast: true });
    }
    expect(blocked).toEqual([]);
  });
});

test.describe("Supabase에 닿지 않을 때 내장 데이터로 대신", () => {
  test.skip(!FALLBACK_URL, "OFFLINE_FALLBACK_URL이 없으면 건너뜁니다.");

  test("공개 화면이 내용과 함께 뜹니다", async ({ page, context }) => {
    const blocked = await blockExternal(context);
    for (const { path, text } of PUBLIC_PAGES) {
      await page.goto(`${FALLBACK_URL}${path}`);
      await expect(page.getByRole("main")).toContainText(text);
    }
    expect(blocked).toEqual([]);
  });

  // 빌드 때 만든 캐시가 있으면 Supabase를 부르지 않으므로 여기서는 내용만 확인합니다.
  // "오프라인 데이터로 표시 중" 안내(role="status")는 단위 테스트(DataFallbackNotice, repository.fallback)가 확인합니다.
  test("어드민 목록이 내용과 함께 뜹니다", async ({ page, context }) => {
    const blocked = await blockExternal(context);
    await loginDemo(page, FALLBACK_URL);
    await page.goto(`${FALLBACK_URL}/admin/figures`);
    await expect(page.getByRole("main").getByRole("row").nth(1)).toBeVisible();
    await expectNoAxeViolations(page, { skipContrast: true });
    expect(blocked).toEqual([]);
  });
});
