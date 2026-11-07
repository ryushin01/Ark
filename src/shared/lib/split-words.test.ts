import { describe, expect, it } from "vitest";

import { splitWords } from "./split-words";

describe("splitWords", () => {
  it("공백을 기준으로 단어를 나눕니다", () => {
    expect(splitWords("세계  신화\n도서관")).toEqual(["세계", "신화", "도서관"]);
  });

  it("빈 문자열이면 빈 배열을 돌려줍니다", () => {
    expect(splitWords("   ")).toEqual([]);
  });
});
