// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const updateTag = vi.fn();
vi.mock("next/cache", () => ({ updateTag }));
vi.mock("next/navigation", async () => ({
  redirect: (await import("@/shared/auth/index.test-utils")).redirectTo,
}));

const { finishAdminAction } = await import("./admin-action.server");

describe("finishAdminAction", () => {
  it("캐시를 갱신하고 결과를 담은 목록 주소로 이동합니다", () => {
    expect(() => finishAdminAction("figures", "/admin/figures", "saved", "odin")).toThrow(
      expect.objectContaining({ url: "/admin/figures?saved=odin" }),
    );
    expect(updateTag).toHaveBeenCalledWith("figures");
  });

  it("주소에 넣을 수 없는 글자는 바꿔 넣습니다", () => {
    expect(() => finishAdminAction("exhibits", "/admin/exhibits", "deleted", "a&b c")).toThrow(
      expect.objectContaining({ url: "/admin/exhibits?deleted=a%26b%20c" }),
    );
  });
});
