// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { isTableFallback, isUsingFallbackData, markFallback, markLive } =
  await import("./data-source.server");

describe("data-source", () => {
  it("테이블마다 대체 상태를 남기고, 같은 테이블은 한 번만 경고합니다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(isUsingFallbackData()).toBe(false);

    markFallback("figures", new Error("fetch failed"));
    markFallback("figures", new Error("fetch failed"));
    markFallback("relics", "시간 초과");

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain("figures");
    expect(warn.mock.calls[0]?.[0]).toContain("fetch failed");
    expect(warn.mock.calls[1]?.[0]).toContain("시간 초과");
    expect(isTableFallback("figures")).toBe(true);
    expect(isTableFallback("works")).toBe(false);

    markLive("figures");
    expect(isTableFallback("figures")).toBe(false);
    expect(isUsingFallbackData()).toBe(true);
    markLive("relics");
    expect(isUsingFallbackData()).toBe(false);
  });
});
