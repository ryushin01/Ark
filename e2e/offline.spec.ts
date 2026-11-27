import AxeBuilder from "@axe-core/playwright";
import { type BrowserContext, expect, type Page, test } from "@playwright/test";

import { MOCK_EXHIBITS } from "../src/entities/exhibit/api/mock-data";
import { MOCK_FIGURES } from "../src/entities/figure/api/mock-data";
import { MOCK_GENEALOGIES } from "../src/entities/genealogy/api/mock-data";
import { MOCK_PANTHEONS } from "../src/entities/pantheon/api/mock-data";
import { MOCK_RELICS } from "../src/entities/relic/api/mock-data";
import { MOCK_WORKS } from "../src/entities/work/api/mock-data";

/**
 * 오프라인 검사 (pnpm test:e2e:offline, CI의 E2E에 포함)
 * 브라우저에서 localhost 밖으로 나가는 요청을 모두 막고, 비밀 값(.env) 없이 띄운 서버에서
 * 모든 라우트와 주요 상태(검색, 필터 주소 공유, 상세 이동, 어드민 목록·편집)가 내용과 함께 뜨는지,
 * 오류 화면·끝나지 않는 로딩·깨진 그림·접근성 위반이 없는지 확인합니다.
 * 두 서버에서 같은 검사를 돌립니다.
 * - 메모리 목업: Supabase 접속 정보 없음(clone → install → build만 한 로컬 실행과 같음)
 * - 내장 데이터 대체(OFFLINE_FALLBACK_URL): Supabase 주소는 있지만 닿지 않음(.invalid)
 *   → 배포본에서 Supabase가 끊겼을 때와 같습니다.
 */
test.use({ reducedMotion: "reduce" });

const FALLBACK_URL = process.env.OFFLINE_FALLBACK_URL;

const SERVERS = [
  { name: "메모리 목업", baseURL: "" },
  { name: "Supabase 끊김(내장 데이터 대체)", baseURL: FALLBACK_URL },
];

function must<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`목업 데이터에 ${label}이(가) 없습니다.`);
  return value;
}

const zeus = must(
  MOCK_FIGURES.find((figure) => figure.slug === "zeus"),
  "제우스",
);
const greek = must(
  MOCK_PANTHEONS.find((pantheon) => pantheon.slug === "greek"),
  "그리스 신화",
);
const relic = must(MOCK_RELICS[0], "유물");
const genealogy = must(MOCK_GENEALOGIES[0], "계보");
const exhibit = must(MOCK_EXHIBITS[0], "자료");
const work = must(MOCK_WORKS[0], "영향 작품");
const genealogyPantheon = must(
  MOCK_PANTHEONS.find((pantheon) => pantheon.slug === genealogy.pantheonSlug),
  "계보의 계열",
);

/** 공개 화면: 주소와 그 화면 본문에 꼭 보여야 하는 글 */
const PUBLIC_PAGES = [
  { label: "홈 악보 무대·대륙별 계열", path: "/", text: greek.name },
  { label: "신 찾기", path: "/figures", text: zeus.name },
  {
    label: "신 찾기(필터 주소 공유)",
    path: "/figures?q=%EC%B2%9C%EB%91%A5&continent=africa",
    text: "신과 인물",
  },
  { label: "계열", path: `/pantheons/${greek.slug}`, text: zeus.name },
  { label: "계보", path: `/pantheons/${genealogyPantheon.slug}`, text: "신들의 계보" },
  { label: "인물 상세", path: `/figures/${zeus.slug}`, text: zeus.epithet },
  { label: "인물 상세(가족·탈것)", path: "/figures/odin", text: "탈것·동반자" },
  { label: "비밀 전시실", path: "/vault", text: relic.name },
  { label: "유물 상세", path: `/vault/${relic.slug}`, text: relic.name },
  { label: "없는 주소(404)", path: "/figures/no-such-figure", text: "이 도서관에 없습니다" },
];

/** 어드민 화면: 주소와 1단계 제목 */
const ADMIN_PAGES = [
  { path: "/admin/pantheons", heading: "신화 계열", list: true },
  { path: "/admin/figures", heading: "신·인물", list: true },
  { path: "/admin/genealogies", heading: "계보", list: true },
  { path: "/admin/exhibits", heading: "소장 자료", list: true },
  { path: "/admin/relics", heading: "유물", list: true },
  { path: "/admin/works", heading: "영향 작품", list: true },
  { path: `/admin/pantheons/${greek.slug}`, heading: new RegExp(greek.name), list: false },
  { path: `/admin/figures/${zeus.slug}`, heading: new RegExp(zeus.name), list: false },
  {
    path: `/admin/genealogies/${genealogy.pantheonSlug}`,
    heading: new RegExp(genealogyPantheon.name),
    list: false,
  },
  { path: `/admin/exhibits/${exhibit.id}`, heading: new RegExp(exhibit.title), list: false },
  { path: `/admin/relics/${relic.slug}`, heading: new RegExp(relic.name), list: false },
  { path: `/admin/works/${work.slug}`, heading: new RegExp(work.title), list: false },
  { path: "/admin/figures/new", heading: /새 /, list: false },
  { path: "/admin/exhibits/new", heading: /새 /, list: false },
];

/** 오류 화면의 제목 (공개 사이트·어드민) */
const ERROR_HEADINGS = /기록을 불러오지 못했습니다|화면을 불러오지 못했습니다/;

/** localhost 밖으로 나가는 요청을 막고, 막은 주소를 모읍니다. 글꼴·스크립트·그림 모두 해당합니다. */
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

/** 화면에서 난 처리되지 않은 오류(하이드레이션 실패 등)를 모읍니다. */
function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
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

/** 받아 둔 그림이 모두 실제로 그려졌는지 (깨진 그림 아이콘이 없는지) */
async function expectImagesLoaded(page: Page) {
  const broken = await page.locator("img").evaluateAll((images) =>
    images
      .filter((image) => image instanceof HTMLImageElement)
      .filter((image) => image.loading !== "lazy" && image.complete && image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
  );
  expect(broken).toEqual([]);
}

/** 본문이 내용과 함께 떴고, 오류 화면이나 끝나지 않는 로딩이 아닌지 */
async function expectSettled(page: Page, text: string | RegExp) {
  const main = page.getByRole("main");
  await expect(main).toContainText(text);
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: ERROR_HEADINGS })).toHaveCount(0);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  expect((await main.innerText()).trim().length).toBeGreaterThan(20);
}

async function loginDemo(page: Page, baseURL = "") {
  await page.goto(`${baseURL}/admin/login`);
  await page.getByRole("button", { name: "데모 계정으로 둘러보기" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "대시보드" })).toBeVisible();
}

const searchbox = (page: Page) =>
  page.getByRole("searchbox", { name: "이름·별칭·영역·유물로 찾기" });

for (const { name, baseURL } of SERVERS) {
  test.describe(`오프라인 · ${name}`, () => {
    test.skip(baseURL === undefined, "OFFLINE_FALLBACK_URL이 없으면 건너뜁니다.");
    const at = (path: string) => `${baseURL ?? ""}${path}`;

    for (const { label, path, text } of PUBLIC_PAGES) {
      test(`${label}(${path}): 내용과 함께 뜨고 외부 요청·깨진 그림·접근성 위반이 없습니다`, async ({
        page,
        context,
      }) => {
        const blocked = await blockExternal(context);
        const errors = collectPageErrors(page);
        await page.goto(at(path));
        await expectSettled(page, text);
        await expectImagesLoaded(page);
        await expectNoAxeViolations(page);
        expect(errors).toEqual([]);
        expect(blocked).toEqual([]);
      });
    }

    test("작은 화면: 홈과 신 상세가 내용과 함께 뜨고 접근성 위반이 없습니다", async ({
      page,
      context,
    }) => {
      const blocked = await blockExternal(context);
      await page.setViewportSize({ width: 375, height: 800 });
      for (const path of ["/", `/figures/${zeus.slug}`, "/vault"]) {
        await page.goto(at(path));
        await expectSettled(page, path === "/vault" ? relic.name : zeus.name);
        await expectImagesLoaded(page);
        await expectNoAxeViolations(page);
      }
      expect(blocked).toEqual([]);
    });

    test("홈 → 대륙 필터 → 계열 → 계보 → 신 상세로 이동합니다", async ({ page, context }) => {
      const blocked = await blockExternal(context);
      await page.goto(at("/"));
      const filters = page.getByRole("group", { name: "대륙으로 거르기" });
      const europe = filters.getByRole("button", { name: /^유럽/ });
      await europe.click();
      await expect(europe).toHaveAttribute("aria-pressed", "true");
      await page
        .getByRole("link", { name: /그리스 신화/ })
        .filter({ visible: true })
        .first()
        .click();
      await expect(page.getByRole("heading", { level: 1, name: "그리스 신화" })).toBeVisible();
      await page
        .getByRole("region", { name: "신들의 계보" })
        .getByRole("link", { name: "케르베로스" })
        .click();
      await expect(page).toHaveURL(/\/figures\/cerberus$/);
      await expect(page.getByRole("heading", { level: 1, name: "케르베로스" })).toBeVisible();
      await expectSettled(page, "케르베로스");
      expect(blocked).toEqual([]);
    });

    test("신 찾기: 검색 결과를 보고, 필터를 주소로 공유하고, 상세로 이동합니다", async ({
      page,
      context,
    }) => {
      const blocked = await blockExternal(context);
      await page.goto(at("/figures"));
      await searchbox(page).fill("천둥");
      await expect(page.getByText(/^신과 인물 \d+명$/)).toBeVisible();
      await page.getByRole("button", { name: /^아프리카/ }).click();
      await expect(page).toHaveURL(/[?&]continent=africa/);
      await expect(page).toHaveURL(/[?&]q=/);
      // 같은 주소를 새로 열어도(공유한 주소) 같은 결과가 나옵니다.
      await page.goto(page.url());
      await expect(searchbox(page)).toHaveValue("천둥");
      const cards = page.locator('a[href^="/figures/"]').filter({ visible: true });
      await expect(cards).toHaveCount(1);
      await cards.first().click();
      await expect(page).toHaveURL(/\/figures\/[a-z0-9-]+$/);
      await expectSettled(page, /./);
      expect(blocked).toEqual([]);
    });

    test("비밀 전시실: 전시 목록에서 유물 상세로 갑니다", async ({ page, context }) => {
      const blocked = await blockExternal(context);
      await page.goto(at("/vault"));
      await page.getByRole("button", { name: "전시 목록" }).click();
      await page
        .getByRole("dialog", { name: /전시 목록/ })
        .getByRole("link", { name: new RegExp(relic.name) })
        .click();
      await expect(
        page.getByRole("heading", { level: 1, name: relic.name }).filter({ visible: true }),
      ).toBeVisible();
      await expectImagesLoaded(page);
      expect(blocked).toEqual([]);
    });

    test("어드민: 데모 계정으로 대시보드·모든 목록·편집 화면이 뜹니다", async ({
      page,
      context,
    }) => {
      test.setTimeout(180_000);
      const blocked = await blockExternal(context);
      const errors = collectPageErrors(page);
      await loginDemo(page, baseURL);
      // 대시보드: 항목마다 개수가 나옵니다.
      await expect(page.getByRole("link", { name: /신·인물 \d+/ })).toBeVisible();
      await expectNoAxeViolations(page, { skipContrast: true });
      for (const { path, heading, list } of ADMIN_PAGES) {
        await page.goto(at(path));
        await expect(page.getByRole("heading", { level: 1, name: heading }), path).toBeVisible();
        await expect(page.getByRole("heading", { name: ERROR_HEADINGS })).toHaveCount(0);
        if (list) await expect(page.getByRole("main").getByRole("row").nth(1)).toBeVisible();
        await expectImagesLoaded(page);
        await expectNoAxeViolations(page, { skipContrast: true });
      }
      expect(errors).toEqual([]);
      expect(blocked).toEqual([]);
    });

    test("소식 피드·사이트맵·robots가 응답합니다", async ({ request }) => {
      for (const path of ["/feed.xml", "/sitemap.xml", "/robots.txt"]) {
        const response = await request.get(at(path));
        expect(response.status(), path).toBe(200);
        expect((await response.text()).length, path).toBeGreaterThan(50);
      }
    });
  });
}

test.describe("이미지 저장소가 끊겼을 때", () => {
  /** 자료 그림을 모두 막아, 그림을 받지 못한 자리를 만듭니다(자리 표시 그림은 통과). */
  async function blockImages(context: BrowserContext) {
    await blockExternal(context);
    await context.route(/\/(images\/exhibits[a-z-]*\/|_next\/image\?)/, (route) =>
      route.abort("internetdisconnected"),
    );
  }

  for (const path of [`/figures/${zeus.slug}`, "/vault", `/vault/${relic.slug}`, "/"]) {
    test(`${path}: 받지 못한 그림은 흐린 자리 표시로 바뀝니다`, async ({ page, context }) => {
      await blockImages(context);
      await page.goto(path);
      await expect(page.getByRole("main")).not.toBeEmpty();
      await page.waitForLoadState("networkidle");
      await expect(page.locator("img[data-image-fallback]").first()).toBeAttached();
      await expectImagesLoaded(page);
      await expectNoAxeViolations(page);
    });
  }

  test("어드민 자료 목록도 자리 표시로 바뀝니다", async ({ page, context }) => {
    await blockImages(context);
    await loginDemo(page);
    await page.goto("/admin/exhibits");
    await expect(page.getByRole("main").getByRole("row").nth(1)).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("img[data-image-fallback]").first()).toBeAttached();
    await expectImagesLoaded(page);
  });
});

test("Storybook이 외부 요청 없이 뜹니다", async ({ page, context }) => {
  const blocked = await blockExternal(context);
  const response = await page.goto("/storybook/index.html");
  test.skip(response?.status() === 404, "Storybook을 빌드하지 않았습니다(pnpm build).");
  await expect(page.locator("#storybook-preview-iframe")).toBeAttached();
  await page.waitForLoadState("networkidle");
  expect(blocked).toEqual([]);
});
