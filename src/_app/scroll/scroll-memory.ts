/**
 * 주소별 스크롤 위치 기억
 * 뒤로·앞으로 가거나 새로고침한 뒤 뒤로 갔을 때 보던 자리로 돌아가도록 세션 저장소에 남깁니다.
 * 해시(#)는 빼고 경로와 검색어로만 구분합니다.
 */
export const STORAGE_KEY = "ark:scroll";
/** 오래된 것부터 지워 이 개수만 남깁니다. */
export const MAX_ENTRIES = 50;

type Memory = Record<string, number>;

export const scrollKey = (location: Pick<Location, "pathname" | "search">) =>
  `${location.pathname}${location.search}`;

function read(storage: Storage | undefined): Memory {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Memory) : {};
  } catch {
    return {};
  }
}

export function loadScroll(storage: Storage | undefined, key: string): number | undefined {
  const y = read(storage)[key];
  return typeof y === "number" && Number.isFinite(y) && y >= 0 ? y : undefined;
}

export function saveScroll(storage: Storage | undefined, key: string, y: number) {
  const memory = read(storage);
  // 다시 넣어 가장 최근 항목으로 옮깁니다(객체의 문자열 키는 넣은 순서를 지킵니다).
  delete memory[key];
  memory[key] = Math.max(0, Math.round(y));
  const keys = Object.keys(memory);
  for (const old of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) delete memory[old];
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // 저장소를 쓸 수 없으면(사생활 보호 모드 등) 기억하지 않습니다.
  }
}

/** 뒤로·앞으로 가기로 문서를 새로 불러왔는지(새로고침 뒤 뒤로 가기 등) */
export function isBackForwardLoad(perf: Performance | undefined = globalThis.performance) {
  const entry = perf?.getEntriesByType?.("navigation")[0] as
    PerformanceNavigationTiming | undefined;
  return entry?.type === "back_forward";
}
