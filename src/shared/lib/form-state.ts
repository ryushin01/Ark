import type { z } from "zod";

/** Server Action이 폼에 돌려주는 결과 */
export type FormState = {
  status: "idle" | "error" | "success";
  /** 폼 위에 보여 줄 안내 (오류 요약 또는 완료) */
  message?: string;
  /** 칸별 오류 메시지 */
  fieldErrors?: Record<string, string[] | undefined>;
  /** 제출한 값. 오류가 나도 입력한 내용이 사라지지 않게 폼을 다시 채웁니다. */
  values?: Record<string, string | string[]>;
  /** 제출 시각. 폼을 이 값으로 다시 그려 기본값을 새로 적용합니다. */
  submittedAt?: number;
};

export const INITIAL_FORM_STATE: FormState = { status: "idle" };

/** zod 검사 결과를 폼 오류 상태로 바꿉니다. */
export function toFieldErrors(error: z.ZodError): FormState {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return {
    status: "error",
    message: `입력값을 확인해 주세요. 고칠 칸이 ${Object.keys(fieldErrors).length}개 있습니다.`,
    fieldErrors,
  };
}

/** FormData에서 필요한 칸만 꺼냅니다. 여러 값을 고르는 칸(체크박스)은 listKeys에 적습니다. */
export function readForm(
  formData: FormData,
  keys: readonly string[],
  listKeys: readonly string[] = [],
) {
  const values: Record<string, string | string[]> = {};
  for (const key of keys) values[key] = String(formData.get(key) ?? "");
  for (const key of listKeys) values[key] = formData.getAll(key).map(String);
  return values;
}

/** 검사에 실패한 결과에 제출한 값을 붙입니다. */
export function withValues(state: FormState, values: Record<string, string | string[]>): FormState {
  return { ...state, values, submittedAt: Date.now() };
}

/** 빈 줄을 기준으로 문단을 나눕니다. */
export function splitParagraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

/** 쉼표로 구분한 목록을 나눕니다. */
export function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
