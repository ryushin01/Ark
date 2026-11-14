import { describe, expect, it } from "vitest";

import { optionalText, SLUG_PATTERN, slugField } from "./form-fields";

describe("SLUG_PATTERN·slugField", () => {
  it("영문 소문자·숫자를 하이픈으로 이은 이름만 받습니다", () => {
    for (const ok of ["zeus", "final-fantasy", "a1-b2"]) expect(SLUG_PATTERN.test(ok)).toBe(true);
    for (const bad of ["Zeus", "final fantasy", "-zeus", "zeus-", "a--b", "제우스", ""]) {
      expect(SLUG_PATTERN.test(bad)).toBe(false);
    }
  });

  it("앞뒤 공백은 지우고, 규칙을 어기면 예시가 든 안내를 돌려줍니다", () => {
    expect(slugField("zeus").parse("  zeus ")).toBe("zeus");
    const result = slugField("celtic").safeParse("Celtic Myth");
    expect(result.error?.issues[0]?.message).toBe(
      "주소 이름은 영문 소문자, 숫자, 하이픈(-)으로 입력해 주세요. 예) celtic",
    );
  });
});

describe("optionalText", () => {
  it("공백만 있거나 비었으면 null, 아니면 앞뒤 공백을 지운 글자입니다", () => {
    expect(optionalText().parse("")).toBeNull();
    expect(optionalText().parse("   ")).toBeNull();
    expect(optionalText().parse("  루브르 박물관 ")).toBe("루브르 박물관");
  });
});
