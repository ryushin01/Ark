import { expect, type Page, test } from "@playwright/test";
import { z } from "zod";

/**
 * 시각 회귀 검사 (pnpm test:visual)
 * 주요 화면(데스크톱·모바일)과 Storybook 스토리를 기준 이미지(e2e/__screenshots__)와 비교합니다.
 * - 기준 이미지는 Linux CI(Playwright 공식 Docker 이미지, ci.yml의 visual 작업)에서 만든 것입니다.
 *   macOS 등 다른 환경은 글꼴 렌더링이 달라 비교하지 않고 건너뜁니다. 로컬에서는 docs/development.md의
 *   "시각 회귀"대로 Docker 안의 브라우저로 돌립니다.
 * - 움직임을 멈춥니다: prefers-reduced-motion(사이트가 SSGOI 화면 전환·Lenis·드러남 효과를 끔),
 *   CSS 애니메이션·전환 끄기, 글꼴을 다 받을 때까지 기다림, 시계 같은 바뀌는 글자는 가림.
 * 화면을 일부러 바꿨으면 `pnpm test:visual --update-snapshots`(Linux) 또는 CI 실패 결과물의 새 이미지로 기준을 바꿉니다.
 */
test.skip(
  process.platform !== "linux" && !process.env.PW_TEST_CONNECT_WS_ENDPOINT,
  "기준 이미지는 Linux에서 만들었습니다. 로컬은 Docker 브라우저로 돌립니다.",
);

test.use({
  reducedMotion: "reduce",
  colorScheme: "light",
  locale: "ko-KR",
  timezoneId: "Asia/Seoul",
});

const FREEZE_CSS = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    caret-color: transparent !important;
    content-visibility: visible !important;
  }
`;

/** 그림·글꼴을 다 받고 움직임이 멈출 때까지 기다립니다. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images).filter((image) => image.loading !== "lazy");
    await Promise.all(
      images.map((image) =>
        image.complete
          ? null
          : new Promise((done) => image.addEventListener("load", done, { once: true })),
      ),
    );
  });
}

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 375, height: 800 },
];

const PAGES = [
  { name: "home", path: "/" },
  { name: "figures", path: "/figures" },
  { name: "figure-zeus", path: "/figures/zeus" },
  { name: "pantheon-greek", path: "/pantheons/greek" },
  { name: "vault", path: "/vault" },
  { name: "vault-mjolnir", path: "/vault/mjolnir" },
  { name: "not-found", path: "/figures/no-such-figure" },
  { name: "admin-login", path: "/admin/login" },
];

for (const viewport of VIEWPORTS) {
  test.describe(`화면 · ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const { name, path } of PAGES) {
      test(`${name}`, async ({ page }) => {
        await page.goto(path);
        await settle(page);
        await expect(page).toHaveScreenshot(`${name}-${viewport.name}.png`, {
          mask: [page.locator("time")],
        });
      });
    }

    test("admin-dashboard", async ({ page }) => {
      await page.goto("/admin/login");
      await page.getByRole("button", { name: "데모 계정으로 둘러보기" }).click();
      await expect(page.getByRole("heading", { level: 1, name: "대시보드" })).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`admin-dashboard-${viewport.name}.png`);
    });
  });
}

const storyIndexSchema = z.object({
  entries: z.record(
    z.string(),
    z.object({ id: z.string(), type: z.string(), title: z.string(), name: z.string() }),
  ),
});

test.describe("Storybook 스토리", () => {
  test("모든 스토리가 기준 이미지와 같습니다", async ({ page, request }) => {
    test.setTimeout(300_000);
    const response = await request.get("/storybook/index.json");
    test.skip(!response.ok(), "Storybook을 빌드하지 않았습니다(pnpm build).");
    const { entries } = storyIndexSchema.parse(await response.json());
    const stories = Object.values(entries).filter((entry) => entry.type === "story");
    expect(stories.length).toBeGreaterThan(0);
    await page.setViewportSize({ width: 800, height: 600 });
    for (const story of stories) {
      await test.step(story.id, async () => {
        await page.goto(`/storybook/iframe.html?id=${story.id}&viewMode=story`);
        await page.locator("#storybook-root").waitFor();
        await settle(page);
        await expect.soft(page).toHaveScreenshot(`story-${story.id}.png`, {
          mask: [page.locator("time")],
        });
      });
    }
  });
});
