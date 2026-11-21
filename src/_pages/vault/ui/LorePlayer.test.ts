import { describe, expect, it } from "vitest";

import { splitSentences } from "./LorePlayer";

describe("splitSentences", () => {
  it("마침표·물음표·느낌표 뒤에서 문장을 나누고 빈 조각은 버립니다", () => {
    expect(splitSentences("묠니르. 던지면 돌아옵니다!  누가 만들었나? ")).toEqual([
      "묠니르.",
      "던지면 돌아옵니다!",
      "누가 만들었나?",
    ]);
  });

  it("문장 부호가 없으면 통째로 한 문장입니다", () => {
    expect(splitSentences("이름 없는 유물")).toEqual(["이름 없는 유물"]);
  });
});
