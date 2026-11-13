import { describe, expect, it } from "vitest";

import { MOCK_RELICS } from "../api/mock-data";
import { neighborsOf, relicsOf } from "./relics";

describe("신화 속 유물", () => {
  it("주소 이름이 겹치지 않고, 모든 유물에 지닌 이가 있다", () => {
    const slugs = MOCK_RELICS.map((relic) => relic.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const relic of MOCK_RELICS)
      expect(relic.figureSlugs.length, relic.slug).toBeGreaterThan(0);
  });

  it("신·인물이 지닌 유물을 전시 순서대로 모은다", () => {
    expect(relicsOf(MOCK_RELICS, "odin").map((relic) => relic.slug)).toEqual([
      "gungnir",
      "draupnir",
    ]);
    expect(relicsOf(MOCK_RELICS, "laima")).toEqual([]);
  });

  it("앞뒤 진열장은 처음과 끝이 이어진다", () => {
    const first = MOCK_RELICS[0];
    const last = MOCK_RELICS[MOCK_RELICS.length - 1];
    expect(neighborsOf(MOCK_RELICS, first.slug)).toEqual({ prev: last, next: MOCK_RELICS[1] });
    expect(neighborsOf(MOCK_RELICS, "unknown")).toBeNull();
  });
});
