import { describe, expect, it } from "vitest";

import { genealogyInputSchema, slugsIn } from "./schema";

const roots = [
  {
    name: "로키",
    nameEn: "Loki",
    slug: "loki",
    unions: [
      {
        partner: { name: "앙그르보다", nameEn: "Angrboða" },
        children: [{ name: "펜리르", nameEn: "Fenrir", slug: "fenrir" }],
      },
    ],
  },
];

describe("genealogyInputSchema", () => {
  it("JSON 글을 계보로 읽습니다", () => {
    const result = genealogyInputSchema.parse({
      source: "「산문 에다」",
      roots: JSON.stringify(roots),
    });
    expect(result.roots[0]?.unions?.[0]?.children[0]?.slug).toBe("fenrir");
  });

  it("JSON이 아니면 형식 오류를 알려 줍니다", () => {
    const result = genealogyInputSchema.safeParse({ source: "문헌", roots: "[{" });
    expect(result.error?.issues[0]?.message).toMatch(/JSON 형식이 올바르지 않습니다/);
  });

  it("빠진 칸이나 모르는 칸은 위치와 함께 알려 줍니다", () => {
    const missing = genealogyInputSchema.safeParse({
      source: "문헌",
      roots: '[{ "name": "로키" }]',
    });
    expect(missing.error?.issues[0]?.message).toMatch(/^0 › nameEn/);
    const extra = genealogyInputSchema.safeParse({
      source: "문헌",
      roots: '[{ "name": "로키", "nameEn": "Loki", "wife": "시긴" }]',
    });
    expect(extra.success).toBe(false);
  });

  it("문헌이 비면 오류입니다", () => {
    expect(genealogyInputSchema.safeParse({ source: " ", roots: "[]" }).success).toBe(false);
  });
});

describe("slugsIn", () => {
  it("배우자와 자식까지 모든 주소를 모읍니다", () => {
    expect(slugsIn(roots)).toEqual(["loki", "fenrir"]);
  });
});
