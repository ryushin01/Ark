// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { forwardEnvelope, reportServerError } = await import("./server");

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
