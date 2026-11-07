import { z } from "zod";

import { splitList, splitParagraphs } from "@/shared/lib";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 어드민에서 신·인물을 만들거나 고칠 때의 입력값 */
export const figureInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(SLUG_PATTERN, "주소 이름은 영문 소문자, 숫자, 하이픈(-)으로 입력해 주세요. 예) zeus"),
  pantheonSlug: z.string().trim().min(1, "신화 계열을 골라 주세요."),
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
  nameEn: z.string().trim().min(1, "영문 이름을 입력해 주세요."),
  epithet: z.string().trim().min(1, "별칭을 입력해 주세요. 예) 하늘과 번개의 신"),
  domains: z
    .string()
    .transform(splitList)
    .pipe(z.array(z.string()).min(1, "관장하는 영역을 하나 이상 쉼표로 구분해 입력해 주세요.")),
  summary: z.string().trim().min(1, "한 줄 소개를 입력해 주세요."),
  description: z
    .string()
    .transform(splitParagraphs)
    .pipe(z.array(z.string()).min(1, "소개 문단을 하나 이상 입력해 주세요.")),
  order: z.coerce
    .number({ error: "순서를 숫자로 입력해 주세요." })
    .int("순서는 정수로 입력해 주세요.")
    .min(1, "순서는 1 이상이어야 합니다."),
});

export type FigureInput = z.infer<typeof figureInputSchema>;
