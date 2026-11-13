import { z } from "zod";

import { slugField } from "@/shared/lib";

import { RELIC_KINDS } from "./types";

/** 어드민 목록에서 "그림 없음"을 뜻하는 값 (Radix Select는 빈 값을 쓸 수 없음) */
export const NO_IMAGE = "none";

const requiredText = (message: string) => z.string().trim().min(1, message);

/** 어드민에서 유물을 만들거나 고칠 때의 입력값 */
export const relicInputSchema = z.object({
  slug: slugField("mjolnir"),
  name: requiredText("유물 이름을 입력해 주세요."),
  nameEn: requiredText("영문 이름을 입력해 주세요."),
  kind: z.enum(RELIC_KINDS, "갈래를 골라 주세요."),
  figureSlugs: z.array(z.string()).min(1, "지닌 이나 관련 인물을 하나 이상 골라 주세요."),
  origin: requiredText("어떻게 생겨났는지 입력해 주세요."),
  power: requiredText("지닌 힘을 입력해 주세요."),
  price: z
    .string()
    .trim()
    .transform((value) => value || null),
  source: requiredText("전하는 문헌을 입력해 주세요."),
  exhibitId: z
    .string()
    .trim()
    .transform((value) => (value && value !== NO_IMAGE ? value : null)),
  order: z.coerce
    .number({ error: "전시 순서를 숫자로 입력해 주세요." })
    .int("전시 순서는 정수로 입력해 주세요.")
    .min(1, "전시 순서는 1 이상입니다.")
    .max(2_147_483_647, "전시 순서가 너무 큽니다."),
});

export type RelicInput = z.infer<typeof relicInputSchema>;
