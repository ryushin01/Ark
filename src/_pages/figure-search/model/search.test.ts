import { describe, expect, it } from "vitest";

import { includesKorean, matches, normalize, type SearchItem } from "./search";

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
  relics: ["묠니르", "Mjölnir", "메긴교르드", "Megingjörð"],
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

  it("지닌 유물 이름(한글·영문)으로 찾습니다", () => {
    expect(matches(thor, "묠니르")).toBe(true);
    expect(matches(thor, "mjölnir")).toBe(true);
    expect(matches(thor, "궁니르")).toBe(false);
  });

  it("초성으로 찾습니다", () => {
    expect(matches(thor, "ㅌㄹ")).toBe(true);
    expect(matches(thor, "ㅊㄷ")).toBe(true);
    expect(matches(thor, "ㅁㄴㄹ")).toBe(true);
    expect(matches(thor, "ㅂㄷ")).toBe(false);
  });
});

describe("includesKorean (입력하는 중인 글자)", () => {
  const odin = normalize("오딘");

  it("초성과 음절을 섞어 써도 맞습니다", () => {
    expect(includesKorean(odin, "오ㄷ")).toBe(true);
    expect(includesKorean(odin, "ㅇ딘")).toBe(true);
  });

  it("마지막 글자에 아직 받침을 치지 않았으면 받침만 다른 음절과 맞습니다", () => {
    expect(includesKorean(odin, "오디")).toBe(true);
    expect(includesKorean(odin, "오다")).toBe(false);
    // 마지막이 아닌 글자는 정확히 맞아야 합니다.
    expect(includesKorean(normalize("오딘의창"), "오디의")).toBe(false);
  });

  it("영문과 숫자는 그대로 비교합니다", () => {
    expect(includesKorean("odin", "od")).toBe(true);
    expect(includesKorean("odin", "do")).toBe(false);
  });
});
