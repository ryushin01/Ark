import { z } from "zod";

import { WORK_MEDIUMS } from "./types";

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);

/** 어드민에서 작품을 만들거나 고칠 때의 입력값 */
export const workInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "주소 이름은 영문 소문자, 숫자, 하이픈(-)으로 입력해 주세요. 예) final-fantasy",
    ),
  title: z.string().trim().min(1, "작품 이름을 입력해 주세요."),
  titleOriginal: z.string().trim().min(1, "원제를 입력해 주세요."),
  medium: z.enum(WORK_MEDIUMS, "분류를 골라 주세요."),
  year: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : null))
    .pipe(
      z
        .number({ error: "발표 연도를 숫자로 입력해 주세요." })
        .int("발표 연도는 정수로 입력해 주세요.")
        .min(1900, "발표 연도를 확인해 주세요.")
        .max(2100, "발표 연도를 확인해 주세요.")
        .nullable(),
    ),
  creator: optionalText,
  summary: optionalText,
  figureSlugs: z.array(z.string()),
  status: z.enum(["draft", "published"], "공개 여부를 골라 주세요."),
});

export type WorkInput = z.infer<typeof workInputSchema>;
