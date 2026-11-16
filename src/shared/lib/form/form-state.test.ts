import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  duplicateKeyError,
  fieldError,
  fieldErrorsState,
  formError,
  splitList,
  splitParagraphs,
  toFieldErrors,
} from "./form-state";

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

describe("오류 도우미", () => {
  const values = { slug: "odin" };

  it("fieldErrorsState는 고칠 칸 수를 요약에 적는다", () => {
    expect(fieldErrorsState({ a: ["x"], b: ["y"] })).toEqual({
      status: "error",
      message: "입력값을 확인해 주세요. 고칠 칸이 2개 있습니다.",
      fieldErrors: { a: ["x"], b: ["y"] },
    });
  });

  it("formError·fieldError는 제출한 값을 함께 돌려준다", () => {
    expect(formError(values, "없음")).toMatchObject({ status: "error", message: "없음", values });
    expect(fieldError(values, "요약", "slug", "칸")).toMatchObject({
      message: "요약",
      fieldErrors: { slug: ["칸"] },
      values,
    });
  });

  it("duplicateKeyError는 고치는 방법을 칸 메시지에 적는다", () => {
    expect(duplicateKeyError(values, "중복", "odin").fieldErrors).toEqual({
      slug: ["'odin'은(는) 이미 쓰고 있습니다. 다른 주소 이름을 입력해 주세요."],
    });
    expect(duplicateKeyError(values, "중복", "x", "id").fieldErrors).toEqual({
      id: ["'x'은(는) 이미 쓰고 있습니다. 다른 id를 입력해 주세요."],
    });
  });
});
