// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createCookieJar, formDataOf } from "@/shared/auth/index.test-utils";
import { INITIAL_FORM_STATE } from "@/shared/lib";

vi.mock("server-only", () => ({}));

const jar = createCookieJar();
/** 요청마다 다른 IP를 써서, 테스트끼리 로그인 실패 기록이 섞이지 않게 합니다. */
let requestHeaders = new Headers();
vi.mock("next/headers", () => ({
  cookies: async () => jar,
  headers: async () => requestHeaders,
}));
vi.mock("next/navigation", async () => ({
  redirect: (await import("@/shared/auth/index.test-utils")).redirectTo,
}));

const { loginAction, logoutAction } = await import("./actions");
const { getSessionSecret, SESSION_COOKIE, SESSION_MAX_AGE, verifySessionToken } =
  await import("@/shared/auth");

const PASSWORD = "correct-horse-battery";
let ip = 0;

/** 지금 쿠키에 담긴 세션의 역할 */
async function sessionRole() {
  return (await verifySessionToken(jar.values.get(SESSION_COOKIE), getSessionSecret()))?.role;
}

const login = (fields: Record<string, string>) =>
  loginAction(INITIAL_FORM_STATE, formDataOf(fields));

beforeEach(() => {
  jar.clear();
  ip += 1;
  requestHeaders = new Headers({ "x-forwarded-for": `10.0.0.${ip}, 172.16.0.1` });
  vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
  vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("loginAction", () => {
  it("운영 환경에 서명 키가 없으면 로그인을 막습니다", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_SESSION_SECRET", "");
    expect(await login({ mode: "demo" })).toEqual({
      status: "error",
      message: "서버에 ADMIN_SESSION_SECRET이 설정되지 않아 로그인할 수 없습니다.",
    });
    expect(jar.values.size).toBe(0);
  });

  it("데모 로그인은 비밀번호 없이 데모 세션을 만들고 돌아갈 주소로 보냅니다", async () => {
    await expect(login({ mode: "demo", next: "/admin/figures" })).rejects.toMatchObject({
      url: "/admin/figures",
    });
    expect(await sessionRole()).toBe("demo");
    expect(jar.options.get(SESSION_COOKIE)).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/admin",
      maxAge: SESSION_MAX_AGE,
    });
  });

  it("돌아갈 주소가 어드민 밖이면 /admin으로 보냅니다", async () => {
    await expect(login({ mode: "demo", next: "https://evil.example" })).rejects.toMatchObject({
      url: "/admin",
    });
  });

  it("운영 환경에서는 쿠키를 HTTPS로만 보냅니다", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(login({ mode: "demo" })).rejects.toMatchObject({ url: "/admin" });
    expect(jar.options.get(SESSION_COOKIE)).toMatchObject({ secure: true });
  });

  it("비밀번호를 비우면 비밀번호 칸에 오류를 보여 줍니다", async () => {
    expect(await login({ password: "" })).toEqual({
      status: "error",
      message: "비밀번호를 입력해 주세요.",
      fieldErrors: { password: ["비밀번호를 입력해 주세요."] },
    });
  });

  it("비밀번호가 틀리면 남은 횟수를 알리고, 5번 틀리면 잠급니다", async () => {
    for (let left = 4; left >= 1; left -= 1) {
      const state = await login({ password: "wrong" });
      expect(state.message).toBe(
        `비밀번호가 맞지 않습니다. ${left}번 더 틀리면 15분 동안 잠깁니다.`,
      );
      expect(state.fieldErrors).toEqual({ password: ["비밀번호가 맞지 않습니다."] });
    }
    expect((await login({ password: "wrong" })).message).toBe(
      "비밀번호를 5번 틀려 15분 동안 로그인할 수 없습니다.",
    );

    // 잠긴 동안에는 맞는 비밀번호도 받지 않고, 데모 계정을 안내합니다.
    const locked = await login({ password: PASSWORD });
    expect(locked.message).toContain("잠시 뒤 다시 시도하거나 데모 계정으로 둘러보세요.");
    expect(jar.values.size).toBe(0);

    // 데모 로그인은 잠그지 않습니다.
    await expect(login({ mode: "demo" })).rejects.toMatchObject({ url: "/admin" });
    expect(await sessionRole()).toBe("demo");
  });

  it("잠금은 요청한 곳(IP)마다 따로 셉니다", async () => {
    for (let count = 0; count < 5; count += 1) await login({ password: "wrong" });
    requestHeaders = new Headers({ "x-real-ip": `192.168.0.${ip}` });
    expect((await login({ password: "wrong" })).message).toContain("4번 더 틀리면");
  });

  it("맞는 비밀번호면 관리자 세션을 만들고, 그동안의 실패 기록을 지웁니다", async () => {
    await login({ password: "wrong" });
    await login({ password: "wrong" });
    await expect(login({ password: PASSWORD, next: "/admin/works" })).rejects.toMatchObject({
      url: "/admin/works",
    });
    expect(await sessionRole()).toBe("admin");

    jar.clear();
    expect((await login({ password: "wrong" })).message).toContain("4번 더 틀리면");
  });

  it("ADMIN_PASSWORD가 없으면 어떤 비밀번호도 맞지 않습니다", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect((await login({ password: PASSWORD })).fieldErrors).toEqual({
      password: ["비밀번호가 맞지 않습니다."],
    });
  });
});

describe("logoutAction", () => {
  it("세션 쿠키를 지우고 로그인 화면으로 보냅니다", async () => {
    await expect(login({ mode: "demo" })).rejects.toMatchObject({ url: "/admin" });
    expect(jar.values.has(SESSION_COOKIE)).toBe(true);
    await expect(logoutAction()).rejects.toMatchObject({ url: "/admin/login" });
    expect(jar.values.has(SESSION_COOKIE)).toBe(false);
  });
});
