import { expect, test } from "@playwright/test";

import { MOCK_FIGURES } from "../src/entities/figure/api/mock-data";
import { MOCK_GENEALOGIES as GENEALOGIES } from "../src/entities/genealogy/api/mock-data";
import { MOCK_PANTHEONS } from "../src/entities/pantheon/api/mock-data";

import type { GenealogyNode } from "../src/entities/genealogy/model/types";

/** 계보 속 모든 사람 (배우자와 자식까지) */
function people(nodes: GenealogyNode[]): GenealogyNode[] {
  return nodes.flatMap((node) => [
    node,
    ...people(
      (node.unions ?? []).flatMap((union) => [
        ...(union.partner ? [union.partner] : []),
        ...union.children,
      ]),
    ),
  ]);
}

test("계보: 모든 계열과 신·인물 주소가 Ark 데이터에 있습니다", () => {
  const pantheons = new Set(MOCK_PANTHEONS.map((pantheon) => pantheon.slug));
  const figures = new Set(MOCK_FIGURES.map((figure) => figure.slug));
  for (const genealogy of GENEALOGIES) {
    expect(pantheons.has(genealogy.pantheonSlug), genealogy.pantheonSlug).toBe(true);
    const missing = people(genealogy.roots)
      .map((person) => person.slug)
      .filter((slug): slug is string => Boolean(slug) && !figures.has(slug!));
    expect(missing, genealogy.pantheonSlug).toEqual([]);
  }
});

test("계보: 계열 화면에서 계보를 보고 신 화면으로 이동합니다", async ({ page }) => {
  await page.goto("/pantheons/greek");
  const section = page.getByRole("region", { name: "신들의 계보" });
  await expect(section).toBeVisible();
  await section.getByRole("link", { name: "케르베로스" }).click();
  await expect(page).toHaveURL(/\/figures\/cerberus$/);
});

test("가족: 신 상세에서 부모와 형제를 보고 이동합니다", async ({ page }) => {
  await page.goto("/figures/fenrir");
  const family = page.getByRole("region", { name: "가족" });
  await expect(family.getByText("형제자매")).toBeVisible();
  await family.getByRole("link", { name: "로키" }).click();
  await expect(page).toHaveURL(/\/figures\/loki$/);
});

test("탈것·동반자: 오딘의 탈것으로 가면 슬레이프니르에서 타는 이로 돌아옵니다", async ({
  page,
}) => {
  await page.goto("/figures/odin");
  const bonds = page.getByRole("region", { name: "탈것·동반자" });
  await expect(bonds.getByText("동반자", { exact: true })).toBeVisible();
  await expect(bonds.getByRole("link", { name: "후긴과 무닌" })).toBeVisible();
  await bonds.getByRole("link", { name: "슬레이프니르" }).click();
  await expect(page).toHaveURL("/figures/sleipnir");
  const back = page.getByRole("region", { name: "탈것·동반자" }).filter({ visible: true });
  await expect(back.getByText("타는 이", { exact: true })).toBeVisible();
  await expect(back.getByRole("link", { name: "오딘" })).toHaveAttribute("href", "/figures/odin");
});
