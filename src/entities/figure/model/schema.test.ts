import { describe, expect, it } from "vitest";

import { figureInputSchema } from "./schema";

const valid = {
  slug: "hermes",
  pantheonSlug: "greek",
  name: "헤르메스",
  nameEn: "Hermes",
  epithet: "전령의 신",
  domains: "전령, 여행, 상업",
  summary: "신들의 전령입니다.",
  description: "첫 문단\n\n둘째 문단",
  order: "6",
};

describe("figureInputSchema", () => {
  it("쉼표 목록과 문단을 배열로, 순서를 숫자로 바꿉니다", () => {
    const result = figureInputSchema.parse(valid);
    expect(result.domains).toEqual(["전령", "여행", "상업"]);
    expect(result.description).toEqual(["첫 문단", "둘째 문단"]);
    expect(result.order).toBe(6);
  });

  it("주소 이름 규칙을 어기면 안내 메시지를 돌려줍니다", () => {
    const result = figureInputSchema.safeParse({ ...valid, slug: "Hermes God" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/영문 소문자/);
  });

  it("영역을 비우면 오류입니다", () => {
    expect(figureInputSchema.safeParse({ ...valid, domains: " , " }).success).toBe(false);
  });
});
