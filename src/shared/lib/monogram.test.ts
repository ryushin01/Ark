import { describe, expect, it } from "vitest";

import { monogram } from "./monogram";

describe("monogram (그림 대신 새길 영문 이름 첫 글자)", () => {
  it("이름의 첫 글자를 대문자로 돌려줍니다", () => {
    expect(monogram("Hwanin")).toBe("H");
    expect(monogram("ungnyeo")).toBe("U");
    expect(monogram("Ōkuninushi")).toBe("Ō");
  });

  it("앞에 붙은 관사·칭호는 건너뜁니다", () => {
    expect(monogram("The Dagda")).toBe("D");
    expect(monogram("King Munmu")).toBe("M");
    expect(monogram("Prince Hodong")).toBe("H");
    expect(monogram("Princess of Nangnang")).toBe("N");
    expect(monogram("Lady of the Lake")).toBe("L");
    expect(monogram("The Dagda's Cauldron")).toBe("D");
  });

  it("이름의 일부인 낱말은 건너뛰지 않습니다", () => {
    expect(monogram("An Dương Vương")).toBe("A");
    expect(monogram("Ara the Beautiful")).toBe("A");
    expect(monogram("Kingu")).toBe("K");
  });

  it("칭호만 있으면 그 첫 글자를 씁니다", () => {
    expect(monogram("The")).toBe("T");
  });
});

describe("monogram (빈 이름)", () => {
  it("빈 이름이면 빈 글자를 돌려줍니다", () => {
    expect(monogram("")).toBe("");
  });
});
