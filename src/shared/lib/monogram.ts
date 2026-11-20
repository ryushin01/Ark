/** 이름 앞의 관사·칭호 (뒤의 of까지). 'An'처럼 이름의 일부일 수 있는 낱말은 넣지 않습니다. */
const LEADING = /^(?:the|king|queen|prince|princess|lady|lord|saint|st\.|sir)\s+(?:of\s+)?/i;

/**
 * 그림이 없을 때 새길 영문 이름 첫 글자 (신 카드의 기본 그림, 비밀 전시실의 빈 진열장).
 * "The Dagda", "King Munmu", "Princess of Nangnang"처럼 관사·칭호로 시작하면 건너뛰고 이름의 첫 글자를 씁니다.
 */
export function monogram(name: string): string {
  let rest = name.trim();
  for (
    let next = rest.replace(LEADING, "");
    next && next !== rest;
    next = rest.replace(LEADING, "")
  ) {
    rest = next;
  }
  return (rest || name).charAt(0).toUpperCase();
}
