import { z } from "zod";

import { splitParagraphs } from "@/shared/lib";

/** 어드민에서 계열을 고칠 때의 입력값. slug는 바꾸지 않습니다. */
export const pantheonInputSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요."),
  nameEn: z.string().trim().min(1, "영문 이름을 입력해 주세요."),
  region: z.string().trim().min(1, "지역을 입력해 주세요."),
  earliestSource: z.string().trim().min(1, "가장 이른 문헌을 입력해 주세요."),
  eraLabel: z.string().trim().min(1, "시기 표기를 입력해 주세요. 예) 기원전 8세기경"),
  eraYear: z.coerce
    .number({ error: "정렬용 연도를 숫자로 입력해 주세요. 기원전은 음수입니다." })
    .int("정렬용 연도는 정수로 입력해 주세요."),
  summary: z.string().trim().min(1, "한 줄 소개를 입력해 주세요."),
  description: z
    .string()
    .transform(splitParagraphs)
    .pipe(z.array(z.string()).min(1, "소개 문단을 하나 이상 입력해 주세요.")),
  coverExhibitId: z.string().trim().min(1, "대표 자료를 골라 주세요."),
});

export type PantheonInput = z.infer<typeof pantheonInputSchema>;
