/** 주소의 검색 조건 값 하나를 꺼냅니다. 같은 이름이 여러 번 오면 첫 값을 씁니다. */
export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
