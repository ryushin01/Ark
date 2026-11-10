import { describe, expect, it } from "vitest";

import { matches, type SearchItem } from "./search";

const thor: SearchItem = {
  slug: "thor",
  name: "토르",
  nameEn: "Thor",
  epithet: "천둥의 신",
  domains: ["천둥", "농경"],
  pantheonName: "북유럽 신화",
  continent: "europe",
  kind: "god",
  kindLabel: "신",
  image: null,
  exhibitCount: 1,
};

describe("matches", () => {
  it("검색어가 비어 있으면 모두 맞습니다", () => {
    expect(matches(thor, "  ")).toBe(true);
  });

  it("영문 이름은 대소문자를 가리지 않습니다", () => {
    expect(matches(thor, "THOR")).toBe(true);
  });

  it("관장 영역과 계열 이름으로도 찾습니다", () => {
    expect(matches(thor, "농경")).toBe(true);
    expect(matches(thor, "북유럽")).toBe(true);
  });

  it("띄어쓰기가 달라도 찾습니다", () => {
    expect(matches(thor, "천 둥의신")).toBe(true);
  });

  it("분류 이름으로도 찾습니다", () => {
    expect(matches(thor, "영웅")).toBe(false);
    expect(matches({ ...thor, kind: "hero", kindLabel: "영웅" }, "영웅")).toBe(true);
  });

  it("맞지 않으면 false", () => {
    expect(matches(thor, "바다")).toBe(false);
  });
});
