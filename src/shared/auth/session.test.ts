// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  getSessionSecret,
  isPasswordCorrect,
  SESSION_MAX_AGE,
  verifySessionToken,
} from "./session";

const SECRET = "test-secret";

describe("admin session", () => {
  it("만든 토큰을 같은 키로 검사하면 역할을 돌려줍니다", async () => {
    const token = await createSessionToken("demo", SECRET, 1000);
    expect(await verifySessionToken(token, SECRET, 2000)).toEqual({
      role: "demo",
      expiresAt: 1000 + SESSION_MAX_AGE * 1000,
    });
  });

  it("역할을 바꾸거나 다른 키로 검사하면 거부합니다", async () => {
    const token = await createSessionToken("demo", SECRET);
    expect(await verifySessionToken(token.replace(/^demo/, "admin"), SECRET)).toBeNull();
    expect(await verifySessionToken(token, "other-secret")).toBeNull();
  });

  it("만료된 토큰과 키가 없는 경우를 거부합니다", async () => {
    const token = await createSessionToken("admin", SECRET, 0);
    expect(await verifySessionToken(token, SECRET, SESSION_MAX_AGE * 1000 + 1)).toBeNull();
    expect(await verifySessionToken(token, null, 1)).toBeNull();
  });

  it("운영 환경에서 키를 설정하지 않으면 null입니다", () => {
    expect(getSessionSecret({ NODE_ENV: "production" })).toBeNull();
    expect(getSessionSecret({ NODE_ENV: "development" })).toBeTruthy();
    expect(getSessionSecret({ NODE_ENV: "production", ADMIN_SESSION_SECRET: "x" })).toBe("x");
  });

  it("비밀번호가 같을 때만 통과합니다", async () => {
    expect(await isPasswordCorrect("open-sesame", "open-sesame", SECRET)).toBe(true);
    expect(await isPasswordCorrect("open", "open-sesame", SECRET)).toBe(false);
    expect(await isPasswordCorrect("anything", undefined, SECRET)).toBe(false);
  });
});
