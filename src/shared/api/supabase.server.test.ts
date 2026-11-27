// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/** 설정 값을 바꿀 때마다 클라이언트를 새로 만들도록 모듈을 다시 불러옵니다. */
async function loadSupabase() {
  vi.resetModules();
  return import("./supabase.server");
}

describe("getSupabase", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("SUPABASE_URL", "https://project.supabase.test");
    vi.stubEnv("SUPABASE_SECRET_KEY", "secret-test-key");
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("설정 값이 없으면 클라이언트를 만들지 않는다", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    const { getSupabase, isSupabaseEnabled } = await loadSupabase();
    expect(getSupabase()).toBeNull();
    expect(isSupabaseEnabled()).toBe(false);
  });

  it("응답을 그대로 받아 행을 돌려준다", async () => {
    fetchMock.mockResolvedValue(Response.json([{ slug: "zeus" }]));
    const { getSupabase } = await loadSupabase();
    const result = await getSupabase()?.from("pantheons").select("slug");
    expect(result?.error).toBeNull();
    expect(result?.data).toEqual([{ slug: "zeus" }]);
    const input = fetchMock.mock.lastCall?.[0];
    expect(input instanceof Request ? input.url : input).toContain(
      "https://project.supabase.test/rest/v1/pantheons",
    );
  });

  it("오류 상태도 예외 없이 Supabase 오류로 돌려주고 다시 시도하지 않는다", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ message: "서버 오류", code: "XX000" }, { status: 500 }),
    );
    const { getSupabase } = await loadSupabase();
    const result = await getSupabase()?.from("pantheons").select("slug");
    expect(result?.status).toBe(500);
    expect(result?.error?.message).toBe("서버 오류");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("5초 안에 응답하지 않으면 요청을 끊고 오류로 돌려준다", async () => {
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
    const { getSupabase } = await loadSupabase();
    vi.useFakeTimers();
    // 쿼리는 기다리기 시작해야 요청을 보내므로 먼저 Promise로 바꿉니다.
    // PostgREST 자체 재시도(1초·2초·4초 뒤)는 끄고 시간 제한만 봅니다.
    const pending = Promise.resolve(getSupabase()?.from("pantheons").select("slug").retry(false));
    await vi.advanceTimersByTimeAsync(5000);
    const result = await pending;
    expect(result?.data).toBeNull();
    expect(result?.error).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
