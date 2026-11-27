// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/** 가벼운 조회의 결과. 테스트마다 바꿉니다. */
const select = vi.fn();
const getSupabase = vi.fn();
vi.mock("./supabase.server", () => ({ getSupabase }));

const { pingDatabase } = await import("./keep-alive.server");

const connected = () => ({ from: () => ({ select }) });

describe("pingDatabase", () => {
  it("Supabase를 쓰지 않으면 목업 저장소라고 알리고 성공입니다", async () => {
    getSupabase.mockReturnValue(null);
    expect(await pingDatabase()).toEqual({
      ok: true,
      message: "Supabase를 쓰지 않습니다 (목업 저장소).",
    });
  });

  it("조회에 성공하면 계열 수를 알려 줍니다", async () => {
    getSupabase.mockReturnValue(connected());
    select.mockResolvedValue({ error: null, count: 12 });
    expect(await pingDatabase()).toEqual({ ok: true, message: "pantheons 12" });
    expect(select).toHaveBeenCalledWith("slug", { count: "exact", head: true });
  });

  it("조회가 실패하면 오류 메시지를 돌려줍니다", async () => {
    getSupabase.mockReturnValue(connected());
    select.mockResolvedValue({ error: { message: "프로젝트가 일시 정지됨" }, count: null });
    expect(await pingDatabase()).toEqual({ ok: false, message: "프로젝트가 일시 정지됨" });
  });
});
