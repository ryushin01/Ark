import { describe, expect, it } from "vitest";

import { newPantheonInputSchema, pantheonInputSchema } from "./schema";

const valid = {
  name: "켈트 신화",
  nameEn: "Celtic",
  region: "아일랜드·웨일스",
  continent: "europe",
  earliestSource: "「침략의 서」",
  eraLabel: "11세기경",
  eraYear: "1050",
  summary: "섬나라의 신과 영웅 이야기입니다.",
  description: "첫 문단\n\n둘째 문단",
  coverExhibitId: "dagda-commons",
};

describe("pantheonInputSchema", () => {
  it("연도를 숫자로, 소개를 문단 배열로 바꿉니다", () => {
    const result = pantheonInputSchema.parse(valid);
    expect(result.eraYear).toBe(1050);
    expect(result.description).toEqual(["첫 문단", "둘째 문단"]);
  });

  it("기원전은 음수 연도로 받고, 소수는 거절합니다", () => {
    expect(pantheonInputSchema.parse({ ...valid, eraYear: "-800" }).eraYear).toBe(-800);
    const result = pantheonInputSchema.safeParse({ ...valid, eraYear: "800.5" });
    expect(result.error?.issues[0]?.message).toBe("정렬용 연도는 정수로 입력해 주세요.");
  });

  it("대륙은 정해진 값만 받고, 소개 문단이 없으면 오류입니다", () => {
    expect(pantheonInputSchema.safeParse({ ...valid, continent: "atlantis" }).success).toBe(false);
    const empty = pantheonInputSchema.safeParse({ ...valid, description: "  \n\n " });
    expect(empty.error?.issues[0]?.message).toBe("소개 문단을 하나 이상 입력해 주세요.");
  });
});

describe("newPantheonInputSchema", () => {
  it("새 계열은 주소 이름 규칙을 지켜야 합니다", () => {
    expect(newPantheonInputSchema.parse({ ...valid, slug: " celtic " }).slug).toBe("celtic");
    const result = newPantheonInputSchema.safeParse({ ...valid, slug: "Celtic Myth" });
    expect(result.error?.issues[0]?.message).toMatch(/예\) celtic$/);
  });
});
