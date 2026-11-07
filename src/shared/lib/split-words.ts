/** 문장을 단어 단위로 나눕니다. 공백은 버리고, 빈 문자열은 돌려주지 않습니다. */
export function splitWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}
