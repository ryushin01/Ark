import { z } from "zod";

import { EXHIBIT_KINDS } from "./types";

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null);

/**
 * 어드민에서 자료 정보를 고칠 때의 입력값
 * 이미지 파일 자체는 Supabase Storage를 연결한 뒤 올립니다. 지금은 설명과 출처만 고칩니다.
 */
export const exhibitInputSchema = z.object({
  figureSlug: z.string().trim().min(1, "어느 신의 자료인지 골라 주세요."),
  title: z.string().trim().min(1, "자료 이름을 입력해 주세요."),
  kind: z.enum(EXHIBIT_KINDS, "분류를 골라 주세요."),
  dateLabel: optionalText,
  holder: optionalText,
  note: optionalText,
  alt: z
    .string()
    .trim()
    .min(5, "대체 텍스트는 이미지가 무엇을 보여 주는지 5자 이상으로 설명해 주세요."),
  artist: optionalText,
  license: z.string().trim().min(1, "라이선스를 입력해 주세요. 예) Public domain, CC BY 4.0"),
  sourceUrl: z.url("원본 주소를 https://로 시작하는 주소로 입력해 주세요."),
});

export type ExhibitInput = z.infer<typeof exhibitInputSchema>;
