import { expect, test } from "@playwright/test";

const PAGES = ["/", "/figures/odin", "/vault"];

test("소식 피드: /feed.xml이 RSS로 응답하고 최신 버전을 담습니다", async ({ request }) => {
  const response = await request.get("/feed.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await response.text();
  expect(xml).toContain('<rss version="2.0"');
  expect(xml).toContain("<language>ko</language>");
  expect(xml).toMatch(/<item>[\s\S]*<title>v\d+\.\d+\.\d+/);
  expect(xml).toMatch(
    /<link>https:\/\/github\.com\/ryushin01\/Ark\/releases\/tag\/v\d+\.\d+\.\d+<\/link>/,
  );
});

for (const path of PAGES) {
  test(`${path}: 피드 자동 발견 링크가 head에 있습니다`, async ({ page }) => {
    await page.goto(path);
    const href = await page
      .locator('head link[rel="alternate"][type="application/rss+xml"]')
      .getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/\/feed\.xml$/);
  });

  test(`${path}: og:image가 가리키는 주소가 실제 이미지로 응답합니다`, async ({
    page,
    request,
  }) => {
    await page.goto(path);
    const content = await page.locator('head meta[property="og:image"]').getAttribute("content");
    expect(content).toBeTruthy();
    // 운영 주소로 적힌 og:image는 로컬 서버의 같은 경로로 바꿔 확인합니다.
    const { pathname, search } = new URL(content!);
    const response = await request.get(`${pathname}${search}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
  });
}
