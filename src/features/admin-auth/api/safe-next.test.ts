// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));
vi.mock("server-only", () => ({}));

const { safeNextPath } = await import("./actions");

describe("safeNextPath", () => {
  it("어드민 안의 경로만 돌려줍니다", async () => {
    expect(await safeNextPath("/admin/figures?pantheon=greek")).toBe(
      "/admin/figures?pantheon=greek",
    );
    expect(await safeNextPath("/admin")).toBe("/admin");
  });

  it("바깥 주소, 로그인 화면, 빈 값은 /admin으로 바꿉니다", async () => {
    for (const value of [
      "https://evil.example",
      "//evil.example",
      "/figures/zeus",
      "/admin/login",
      "",
      null,
    ]) {
      expect(await safeNextPath(value)).toBe("/admin");
    }
  });
});
