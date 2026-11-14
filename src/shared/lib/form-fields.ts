import { z } from "zod";

/** 주소 이름(slug): 영문 소문자·숫자를 하이픈으로 잇습니다. 예) zeus, final-fantasy */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * 주소 이름 입력 칸. example은 안내 문구에 넣을 예시입니다.
 * 공개 화면 번들에 zod가 딸려 가지 않도록 모듈을 불러올 때가 아니라 부를 때 스키마를 만듭니다.
 */
export const slugField = (example: string) =>
  z
    .string()
    .trim()
    .regex(
      SLUG_PATTERN,
      `주소 이름은 영문 소문자, 숫자, 하이픈(-)으로 입력해 주세요. 예) ${example}`,
    );

/** 비워 둘 수 있는 글자 칸. 앞뒤 공백을 지우고, 비었으면 null로 바꿉니다. */
export const optionalText = () =>
  z
    .string()
    .trim()
    .transform((value) => value || null);
