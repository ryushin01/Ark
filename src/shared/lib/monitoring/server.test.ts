// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { forwardEnvelope, readBoundedText, reportServerError } = await import("./server");

const DSN = "https://abc123@o1.ingest.sentry.io/42";
const envelope = (dsn: string) => `${JSON.stringify({ dsn })}\n{"type":"event"}\n{}`;
const post = (body: string) =>
  new Request("http://localhost/api/monitoring", { method: "POST", body });

describe("monitoring server", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("DSN이 없으면 터널은 404이고 서버 오류도 보내지 않는다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    expect((await forwardEnvelope(post(envelope(DSN)))).status).toBe(404);
    await reportServerError(new Error("x"), { path: "/", method: "GET" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("우리 DSN의 envelope만 Sentry로 넘긴다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    expect((await forwardEnvelope(post(envelope(DSN)))).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://o1.ingest.sentry.io/api/42/envelope/",
      expect.objectContaining({ method: "POST", body: envelope(DSN) }),
    );

    fetchMock.mockClear();
    const other = await forwardEnvelope(post(envelope("https://k@evil.example/1")));
    expect(other.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("브라우저 터널은 NEXT_PUBLIC_SENTRY_DSN으로 검사하고, 서버 오류만 SENTRY_DSN으로 보낸다", async () => {
    const SERVER = "https://srv999@o2.ingest.sentry.io/7";
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    vi.stubEnv("SENTRY_DSN", SERVER);
    expect((await forwardEnvelope(post(envelope(DSN)))).status).toBe(200);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://o1.ingest.sentry.io/api/42/envelope/",
      expect.anything(),
    );
    expect((await forwardEnvelope(post(envelope(SERVER)))).status).toBe(400);
    await reportServerError(new Error("x"), { path: "/", method: "GET" });
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://o2.ingest.sentry.io/api/7/envelope/",
      expect.anything(),
    );
  });

  it("Sentry의 요청 제한 헤더를 그대로 돌려준다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 429,
        headers: { "Retry-After": "3600", "X-Sentry-Rate-Limits": "3600:error:organization" },
      }),
    );
    const limited = await forwardEnvelope(post(envelope(DSN)));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("3600");
    expect(limited.headers.get("x-sentry-rate-limits")).toBe("3600:error:organization");

    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const ok = await forwardEnvelope(post(envelope(DSN)));
    expect(ok.headers.get("retry-after")).toBeNull();
  });

  it("Content-Length 없이 나눠 보낸 큰 본문도 상한에서 멈추고 413", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    let pulled = 0;
    const chunk = new TextEncoder().encode("x".repeat(64 * 1024));
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        if (pulled > 100) controller.close();
        else controller.enqueue(chunk);
      },
    });
    const request = new Request("http://localhost/api/monitoring", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit);
    expect((await forwardEnvelope(request)).status).toBe(413);
    // 200KB 상한이면 64KB 조각 네 개쯤에서 멈춰야 합니다.
    expect(pulled).toBeLessThan(10);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("readBoundedText는 글자가 아닌 바이트로 센다", async () => {
    const korean = "가".repeat(100); // 300바이트
    const make = () => new Request("http://localhost", { method: "POST", body: korean });
    expect(await readBoundedText(make(), 299)).toBeNull();
    expect(await readBoundedText(make(), 300)).toBe(korean);
  });

  it("너무 큰 envelope은 413", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    const big = envelope(DSN) + "x".repeat(300 * 1024);
    expect((await forwardEnvelope(post(big))).status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Sentry가 응답하지 않으면 502이고, 서버 오류 보고 실패는 삼킨다", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    fetchMock.mockRejectedValue(new Error("network"));
    expect((await forwardEnvelope(post(envelope(DSN)))).status).toBe(502);
    await expect(
      reportServerError(new Error("x"), { path: "/", method: "GET" }),
    ).resolves.toBeUndefined();
  });
});
