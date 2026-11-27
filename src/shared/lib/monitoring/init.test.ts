import { afterEach, describe, expect, it, vi } from "vitest";

import type { Metric } from "web-vitals";

type BeforeSend = (event: Record<string, unknown>) => Record<string, unknown>;

const sentry = vi.hoisted(() => ({
  init: vi.fn<(options: { beforeSend: BeforeSend }) => void>(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((callback: (scope: { addEventProcessor: () => void }) => void) =>
    callback({ addEventProcessor: () => {} }),
  ),
}));
vi.mock("./sentry", () => sentry);

/** 지표 관찰기를 달았는지 봅니다. */
const vitals = vi.hoisted(() => ({ subscribed: vi.fn() }));
vi.mock("web-vitals", () => ({
  onCLS: vitals.subscribed,
  onINP: vitals.subscribed,
  onLCP: vitals.subscribed,
  onFCP: vitals.subscribed,
  onTTFB: vitals.subscribed,
}));

const DSN = "https://key@o1.ingest.sentry.io/1";

const metric = (rating: Metric["rating"], navigationURL?: string): Metric => ({
  name: "INP",
  value: 650,
  rating,
  delta: 650,
  id: "v1",
  navigationId: 1,
  entries: [],
  navigationType: "navigate",
  ...(navigationURL && { navigationURL }),
});

/** 환경 변수를 정한 뒤 모듈을 새로 받아, 모듈 안의 Sentry 상태가 테스트끼리 섞이지 않게 합니다. */
async function load(env: { dsn?: string; nodeEnv?: string } = {}) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", env.dsn ?? "");
  if (env.nodeEnv) vi.stubEnv("NODE_ENV", env.nodeEnv);
  return import("./index");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  for (const fn of [sentry.init, sentry.captureException, sentry.captureMessage, vitals.subscribed])
    fn.mockReset();
});

describe("initMonitoring (DSN 없음)", () => {
  it("배포 환경에서는 Sentry도 지표 관찰기도 받지 않습니다", async () => {
    const { initMonitoring } = await load({ nodeEnv: "production" });
    initMonitoring();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(vitals.subscribed).not.toHaveBeenCalled();
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it("개발 모드에서는 지표 관찰기를 달아 콘솔에 남깁니다", async () => {
    const { initMonitoring, reportMetric } = await load({ nodeEnv: "development" });
    initMonitoring();
    await vi.waitFor(() => expect(vitals.subscribed).toHaveBeenCalledTimes(5));
    expect(vitals.subscribed).toHaveBeenCalledWith(reportMetric);
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it("브라우저가 아니면(서버) 아무것도 하지 않습니다", async () => {
    const { initMonitoring } = await load({ dsn: DSN, nodeEnv: "development" });
    vi.stubGlobal("window", undefined);
    initMonitoring();
    vi.unstubAllGlobals();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sentry.init).not.toHaveBeenCalled();
    expect(vitals.subscribed).not.toHaveBeenCalled();
  });
});

describe("initMonitoring (DSN 있음)", () => {
  it("requestIdleCallback이 없는 브라우저도 페이지를 다 받았으면 바로 Sentry를 켭니다", async () => {
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    const { initMonitoring } = await load({ dsn: DSN });
    initMonitoring();
    await vi.waitFor(() => expect(sentry.init).toHaveBeenCalledTimes(1));
    expect(sentry.init.mock.calls[0]?.[0]).toMatchObject({ dsn: DSN, tunnel: "/api/monitoring" });
    expect(vitals.subscribed).toHaveBeenCalledTimes(5);
  });

  it("오류 내용이 아닌 것이 없으면 이벤트를 그대로 보냅니다", async () => {
    const { initMonitoring } = await load({ dsn: DSN });
    initMonitoring();
    await vi.waitFor(() => expect(sentry.init).toHaveBeenCalled());
    const beforeSend = sentry.init.mock.calls[0]?.[0].beforeSend;
    expect(beforeSend?.({ message: "오류" })).toEqual({ message: "오류" });
    expect(beforeSend?.({ request: {} })).toEqual({ request: {} });
  });

  it("받기 전에 난 오류는 메시지와 거부 이유까지 모아 두었다가, 20개까지만 보냅니다", async () => {
    const removed = vi.spyOn(window, "removeEventListener");
    const { initMonitoring } = await load({ dsn: DSN });
    initMonitoring();
    window.dispatchEvent(new ErrorEvent("error", { message: "Script error." }));
    const rejection = new Event("unhandledrejection");
    Object.defineProperty(rejection, "reason", { value: "거부 이유" });
    window.dispatchEvent(rejection);
    for (let index = 0; index < 30; index += 1) {
      window.dispatchEvent(new ErrorEvent("error", { error: new Error(`오류 ${index}`) }));
    }

    await vi.waitFor(() => expect(sentry.captureException).toHaveBeenCalledTimes(20));
    expect(sentry.captureException).toHaveBeenNthCalledWith(1, "Script error.");
    expect(sentry.captureException).toHaveBeenNthCalledWith(2, "거부 이유");

    // 준비된 뒤에는 모으기를 멈춥니다(Sentry가 직접 잡음).
    expect(removed).toHaveBeenCalledWith("error", expect.any(Function));
  });

  it("나쁜 지표는 그 지표가 속한 화면 주소와 함께 경고로 보냅니다", async () => {
    const { initMonitoring, reportMetric } = await load({ dsn: DSN });
    initMonitoring();
    await vi.waitFor(() => expect(sentry.init).toHaveBeenCalled());

    reportMetric(metric("good"));
    reportMetric(metric("poor", "https://ark.example/figures/zeus?tab=1"));
    reportMetric(metric("poor"));
    await vi.waitFor(() => expect(sentry.captureMessage).toHaveBeenCalledTimes(2));
    expect(sentry.captureMessage).toHaveBeenNthCalledWith(
      1,
      "Web Vitals 나쁨: INP",
      expect.objectContaining({
        level: "warning",
        tags: { metric: "INP", rating: "poor", path: "/figures/zeus" },
      }),
    );
    expect(sentry.captureMessage).toHaveBeenNthCalledWith(
      2,
      "Web Vitals 나쁨: INP",
      expect.objectContaining({ tags: expect.objectContaining({ path: location.pathname }) }),
    );
  });

  it("오류 경계에서 잡은 오류를 보냅니다", async () => {
    const { initMonitoring, reportError } = await load({ dsn: DSN });
    initMonitoring();
    const error = new Error("화면 오류");
    reportError(error);
    await vi.waitFor(() => expect(sentry.captureException).toHaveBeenCalledWith(error));
  });

  it("Sentry를 켜지 못해도 앱은 그대로 돌고, 모아 두던 것을 멈춥니다", async () => {
    sentry.init.mockImplementation(() => {
      throw new Error("받기 실패");
    });
    const removed = vi.spyOn(window, "removeEventListener");
    const { initMonitoring, reportError, reportMetric } = await load({ dsn: DSN });
    initMonitoring();
    await vi.waitFor(() =>
      expect(removed).toHaveBeenCalledWith("unhandledrejection", expect.any(Function)),
    );
    expect(() => reportError(new Error("x"))).not.toThrow();
    expect(() => reportMetric(metric("poor"))).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(sentry.captureException).not.toHaveBeenCalled();
    expect(sentry.captureMessage).not.toHaveBeenCalled();
  });
});
