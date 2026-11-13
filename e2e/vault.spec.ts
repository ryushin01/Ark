import { expect, test } from "@playwright/test";

import { MOCK_RELICS } from "../src/entities/relic/api/mock-data";

test.use({ reducedMotion: "reduce" });

test("메뉴의 '유물'로 비밀 전시실에 들어가 전시 목록에서 진열장으로 갑니다", async ({ page }) => {
  await page.goto("/figures");
  await page.getByRole("button", { name: "메뉴" }).filter({ visible: true }).first().click();
  await page.getByRole("dialog", { name: "메뉴" }).getByRole("link", { name: /유물/ }).click();
  await expect(page).toHaveURL("/vault");
  await expect(page.getByRole("heading", { level: 1, name: "비밀 전시실" })).toBeVisible();

  const index = page.getByRole("navigation", { name: "전시 목록" });
  await expect(index.getByRole("link")).toHaveCount(MOCK_RELICS.length);
  await index.getByRole("link", { name: /구사나기의 검/ }).click();
  await expect(page).toHaveURL("/vault#kusanagi");
  const vitrine = page.getByRole("article", { name: "구사나기의 검" });
  // 같은 화면 안의 # 이동을 스크롤 되돌리기가 맨 위로 되돌리지 않습니다.
  await expect(vitrine).toBeInViewport();
  await expect(vitrine.getByText("힘", { exact: true })).toBeVisible();
  await expect(vitrine.getByRole("link", { name: "스사노오" })).toHaveAttribute(
    "href",
    "/figures/susanoo",
  );
});

test("진열장 상세에서 기원·힘·대가·문헌을 읽고, 지닌 이와 다음 진열장으로 이어집니다", async ({
  page,
}) => {
  await page.goto("/vault/gleipnir");
  await expect(page.getByRole("heading", { level: 1, name: "글레이프니르" })).toBeVisible();
  for (const term of ["기원", "힘", "대가", "전하는 문헌", "지닌 이"]) {
    await expect(page.getByRole("term").filter({ hasText: new RegExp(`^${term}$`) })).toBeVisible();
  }
  await expect(page.getByText(/티르가 오른손을/)).toBeVisible();

  const pager = page.getByRole("navigation", { name: "다른 유물" });
  await pager.getByRole("link", { name: /다음 진열장/ }).click();
  await expect(page).toHaveURL("/vault/gram");

  await page.getByRole("link", { name: "시구르드" }).filter({ visible: true }).click();
  await expect(page).toHaveURL("/figures/sigurd");
});

test("그림이 전하지 않는 유물은 빈 진열장으로 보입니다", async ({ page }) => {
  const empty = MOCK_RELICS.find((relic) => relic.exhibitId === null);
  expect(empty, "그림이 없는 유물이 하나는 있어야 이 화면을 검사할 수 있습니다").toBeDefined();
  await page.goto(`/vault/${empty!.slug}`);
  await expect(page.getByText("전하는 그림이 없는 유물")).toBeVisible();
});

test("신 상세의 '지닌 유물'에서 진열장으로 갑니다", async ({ page }) => {
  await page.goto("/figures/thor");
  const relics = page.getByRole("region", { name: "지닌 유물" });
  await relics.getByRole("link", { name: "묠니르" }).click();
  await expect(page).toHaveURL("/vault/mjolnir");
  await expect(
    page.getByRole("heading", { level: 1, name: "묠니르" }).filter({ visible: true }),
  ).toBeVisible();
});

test("주소에 #이 붙은 채 열면 그 진열장으로 갑니다", async ({ page }) => {
  await page.goto("/vault#golden-bride");
  await expect(page.getByRole("article", { name: "황금 신부" })).toBeInViewport();
});

test("#이 붙은 전시실에서 더 내려가 신 화면에 갔다가 뒤로 오면, # 대상이 아니라 보던 자리로 돌아옵니다", async ({
  page,
}) => {
  await page.goto("/vault#kusanagi");
  await expect(page.getByRole("article", { name: "구사나기의 검" })).toBeInViewport();
  // 누를 링크를 먼저 화면에 들인 뒤 위치를 잽니다(클릭이 스스로 더 스크롤하지 않게).
  const owner = page
    .getByRole("article", { name: "여의금고봉" })
    .getByRole("link", { name: "손오공" });
  await owner.scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => Math.round(window.scrollY));
  await owner.click();
  await expect(page).toHaveURL("/figures/sun-wukong");
  await page.goBack();
  await expect(page).toHaveURL("/vault#kusanagi");
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - y))
    .toBeLessThan(5);
});
