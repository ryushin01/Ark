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
  await page.goto("/vault/draupnir");
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
