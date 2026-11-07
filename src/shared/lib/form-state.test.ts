import { describe, expect, it } from "vitest";
import { z } from "zod";

import { splitList, splitParagraphs, toFieldErrors } from "./form-state";

describe("form-state", () => {
  it("빈 줄로 문단을 나누고, 문단 안의 줄바꿈은 공백으로 합칩니다", () => {
    expect(splitParagraphs("첫 줄\n이어짐\n\n\n둘째 문단  ")).toEqual([
      "첫 줄 이어짐",
      "둘째 문단",
    ]);
  });

  it("쉼표 목록에서 빈 항목을 버립니다", () => {
    expect(splitList(" 하늘, 번개 ,, ")).toEqual(["하늘", "번개"]);
  });

  it("zod 오류를 칸별 메시지로 바꿉니다", () => {
    const result = z
      .object({ name: z.string().min(1, "이름을 입력해 주세요.") })
      .safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error)).toMatchObject({
        status: "error",
        fieldErrors: { name: ["이름을 입력해 주세요."] },
      });
    }
  });
});
