/**
 * 어드민 Server Action 테스트 도우미
 * next/headers·next/navigation을 테스트에서 바꿀 때 쓰는 가짜 쿠키 저장소와 redirect,
 * 실제 서명으로 만든 세션 쿠키, 메모리 목업 테이블 되돌리기를 모았습니다.
 */
import { type AdminRole, createSessionToken, getSessionSecret, SESSION_COOKIE } from "./session";

/** redirect()가 던지는 예외. 이동할 주소를 담습니다. */
export class RedirectError extends Error {
  constructor(readonly url: string) {
    super(`redirect: ${url}`);
  }
}

/** next/navigation의 redirect처럼 예외를 던져, 그 뒤의 코드가 실행되지 않게 합니다. */
export function redirectTo(url: string): never {
  throw new RedirectError(url);
}

type CookieOptions = Record<string, unknown>;

/** next/headers의 cookies()가 돌려주는 저장소를 흉내 냅니다. */
export function createCookieJar() {
  const values = new Map<string, string>();
  const options = new Map<string, CookieOptions>();
  return {
    values,
    options,
    get: (name: string) => {
      const value = values.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: (name: string, value: string, option: CookieOptions = {}) => {
      values.set(name, value);
      options.set(name, option);
    },
    delete: (option: string | { name: string }) => {
      values.delete(typeof option === "string" ? option : option.name);
    },
    clear: () => {
      values.clear();
      options.clear();
    },
  };
}

export type CookieJar = ReturnType<typeof createCookieJar>;

/** 실제 서명으로 만든 세션 쿠키를 넣어 그 역할로 로그인한 상태로 만듭니다. */
export async function signInAs(jar: CookieJar, role: AdminRole) {
  const secret = getSessionSecret();
  if (!secret) throw new Error("테스트에서 세션 서명 키를 만들지 못했습니다.");
  jar.set(SESSION_COOKIE, await createSessionToken(role, secret));
}

/** 메모리 목업 테이블을 모두 비워, 다음에 읽을 때 시드 데이터로 다시 채우게 합니다. */
export function resetMockTables() {
  const tables: unknown = Reflect.get(globalThis, "__arkMockTables");
  if (tables instanceof Map) tables.clear();
}

/** 칸 이름과 값으로 FormData를 만듭니다. 배열은 같은 이름으로 여러 번 넣습니다(체크박스). */
export function formDataOf(fields: Record<string, string | string[] | Blob>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) for (const item of value) formData.append(key, item);
    else formData.append(key, value);
  }
  return formData;
}
