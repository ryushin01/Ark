// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { clearFailures, countRecentFailures, recordFailure, WINDOW_MINUTES } =
  await import("./login-throttle.server");

describe("login throttle (메모리)", () => {
  it("기간 안의 실패만 세고, 성공하면 지웁니다", async () => {
    const key = "client-a";
    const now = Date.now();
    await recordFailure(key, now - (WINDOW_MINUTES + 1) * 60 * 1000);
    await recordFailure(key, now - 1000);
    await recordFailure(key, now);
    expect(await countRecentFailures(key, now)).toBe(2);
    await clearFailures(key);
    expect(await countRecentFailures(key, now)).toBe(0);
  });
});
