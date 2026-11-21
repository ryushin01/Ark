/** 전시 번호 표기. 레퍼런스의 N°004처럼 세 자리로 맞춥니다. */
export const relicNo = (order: number) => String(order).padStart(3, "0");
