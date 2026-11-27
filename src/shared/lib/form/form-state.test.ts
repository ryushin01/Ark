import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  duplicateKeyError,
  fieldError,
  fieldErrorsState,
  formError,
  readForm,
  splitList,
  splitParagraphs,
  toFieldErrors,
  withValues,
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

describe("readForm·withValues", () => {
  it("필요한 칸만 꺼내고, 없는 칸은 빈 글자로 채웁니다", () => {
    const formData = new FormData();
    formData.append("name", "오딘");
    formData.append("ignored", "x");
    expect(readForm(formData, ["name", "epithet"])).toEqual({ name: "오딘", epithet: "" });
  });

  it("여러 값을 고르는 칸은 목록으로 꺼냅니다", () => {
    const formData = new FormData();
    formData.append("figureSlugs", "thor");
    formData.append("figureSlugs", "loki");
    expect(readForm(formData, [], ["figureSlugs", "empty"])).toEqual({
      figureSlugs: ["thor", "loki"],
      empty: [],
    });
  });

  it("withValues는 제출한 값과 제출 시각을 붙입니다", () => {
    const state = withValues({ status: "error", message: "확인" }, { slug: "odin" });
    expect(state).toMatchObject({ status: "error", message: "확인", values: { slug: "odin" } });
    expect(typeof state.submittedAt).toBe("number");
  });
});

describe("toFieldErrors (칸이 정해지지 않은 오류)", () => {
  it("칸 없는 오류는 form으로 모으고, 같은 칸의 오류는 이어 붙입니다", () => {
    const result = z
      .object({ name: z.string().min(3, "짧습니다.").regex(/^a/, "a로 시작해야 합니다.") })
      .safeParse({ name: "b" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error).fieldErrors).toEqual({
        name: ["짧습니다.", "a로 시작해야 합니다."],
      });
    }
    const root = z.string("글자를 입력해 주세요.").safeParse(1);
    expect(root.success).toBe(false);
    if (!root.success) {
      expect(toFieldErrors(root.error).fieldErrors).toEqual({ form: ["글자를 입력해 주세요."] });
    }
  });
});
