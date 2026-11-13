import { describe, expect, it } from "vitest";

import { groupByPantheon } from "./group";

import type { Relic } from "@/entities/relic";

const relic = (slug: string, order: number, owner?: string): Relic => ({
  slug,
  name: slug,
  nameEn: slug,
  kind: "weapon",
  figureSlugs: owner ? [owner] : [],
  origin: "",
  power: "",
  price: null,
  source: "",
  exhibitId: null,
  order,
});

const pantheons: Record<string, { slug: string; name: string }> = {
  thor: { slug: "norse", name: "북유럽 신화" },
  zeus: { slug: "greek", name: "그리스 신화" },
  odin: { slug: "norse", name: "북유럽 신화" },
};

describe("전시 목록 묶기", () => {
  it("대표 주인의 계열로 묶고, 처음 나온 순서와 전시 순서를 지킨다", () => {
    const groups = groupByPantheon(
      [relic("gungnir", 3, "odin"), relic("mjolnir", 1, "thor"), relic("aegis", 2, "zeus")],
      (slug) => pantheons[slug],
    );
    expect(groups.map((group) => group.label)).toEqual(["북유럽 신화", "그리스 신화"]);
    expect(groups[0].relics.map((item) => item.slug)).toEqual(["mjolnir", "gungnir"]);
  });

  it("계열을 모르면 '그 밖의 전승'에 넣는다", () => {
    const groups = groupByPantheon([relic("x", 1, "nobody"), relic("y", 2)], () => undefined);
    expect(groups).toEqual([expect.objectContaining({ key: "other", label: "그 밖의 전승" })]);
    expect(groups[0].relics).toHaveLength(2);
  });
});
