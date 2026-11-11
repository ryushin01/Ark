import { describe, expect, it } from "vitest";

import { kindLabel } from "./types";

describe("kindLabel", () => {
  it("신수와 영수는 등급을 함께 적습니다", () => {
    expect(kindLabel({ kind: "monster", grade: "divine" })).toBe("몬스터 · 신수");
    expect(kindLabel({ kind: "monster", grade: "spirit" })).toBe("몬스터 · 영수");
  });

  it("등급이 몬스터면 ‘몬스터’로만 적습니다", () => {
    expect(kindLabel({ kind: "monster", grade: "common" })).toBe("몬스터");
  });

  it("몬스터가 아니면 분류 이름만 적습니다", () => {
    expect(kindLabel({ kind: "hero", grade: null })).toBe("영웅");
  });
});
