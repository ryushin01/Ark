import { describe, expect, it } from "vitest";

import { workInputSchema } from "./schema";

const valid = {
  slug: "final-fantasy",
  title: "파이널 판타지",
  titleOriginal: "Final Fantasy",
  medium: "game",
  year: "1987",
  creator: "",
  summary: "  ",
  figureSlugs: ["odin"],
  status: "draft",
};

describe("workInputSchema", () => {
  it("연도를 숫자로, 빈 칸을 null로 바꿉니다", () => {
    const result = workInputSchema.parse(valid);
    expect(result.year).toBe(1987);
    expect(result.creator).toBeNull();
    expect(result.summary).toBeNull();
  });

  it("연도는 비워 둘 수 있지만, 쓰면 1900~2100년의 정수여야 합니다", () => {
    expect(workInputSchema.parse({ ...valid, year: "" }).year).toBeNull();
    for (const year of ["1850", "2200", "1999.5"]) {
      expect(workInputSchema.safeParse({ ...valid, year }).success).toBe(false);
    }
  });

  it("주소 이름과 공개 여부를 확인합니다", () => {
    expect(workInputSchema.safeParse({ ...valid, slug: "Final Fantasy" }).success).toBe(false);
    const result = workInputSchema.safeParse({ ...valid, status: "archived" });
    expect(result.error?.issues[0]?.message).toBe("공개 여부를 골라 주세요.");
  });
});
