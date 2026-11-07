/**
 * 어드민 세션 토큰
 * 값: "{역할}.{만료 시각}.{서명}". 서명은 ADMIN_SESSION_SECRET으로 만든 HMAC-SHA256입니다.
 * Web Crypto만 써서 proxy와 Server Action 양쪽에서 같은 코드로 검사합니다.
 */
export const SESSION_COOKIE = "ark_admin";
/** 세션 24시간. 20시간 이상이면 시간 제한 안내가 필요 없습니다. (KWCAG 6.2.1, WCAG 2.2.1 예외) */
export const SESSION_MAX_AGE = 60 * 60 * 24;

/** admin: 저장 가능 / demo: 둘러보기만 가능 */
export type AdminRole = "admin" | "demo";

export type AdminSession = { role: AdminRole; expiresAt: number };

const DEV_SECRET = "ark-dev-only-secret-change-me";

/** 서명 키. 운영 환경에서 설정하지 않았으면 null이고, 로그인을 막습니다. */
export function getSessionSecret(env: Record<string, string | undefined> = process.env) {
  if (env.ADMIN_SESSION_SECRET) return env.ADMIN_SESSION_SECRET;
  return env.NODE_ENV === "production" ? null : DEV_SECRET;
}

const encoder = new TextEncoder();

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** 길이가 같은 두 문자열을 시간 차이 없이 비교합니다. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1)
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

export async function createSessionToken(role: AdminRole, secret: string, now = Date.now()) {
  const payload = `${role}.${now + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${await sign(payload, secret)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string | null,
  now = Date.now(),
): Promise<AdminSession | null> {
  if (!token || !secret) return null;
  const [role, expires, signature] = token.split(".");
  if ((role !== "admin" && role !== "demo") || !expires || !signature) return null;
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return null;
  const expected = await sign(`${role}.${expires}`, secret);
  return safeEqual(signature, expected) ? { role, expiresAt } : null;
}

/** 비밀번호를 서명한 값끼리 비교해, 길이·내용에 따른 응답 시간 차이를 없앱니다. */
export async function isPasswordCorrect(
  input: string,
  expected: string | undefined,
  secret: string,
) {
  if (!expected) return false;
  const [a, b] = await Promise.all([sign(input, secret), sign(expected, secret)]);
  return safeEqual(a, b);
}
