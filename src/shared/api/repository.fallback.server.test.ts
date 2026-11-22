// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/** Supabase를 쓰도록 설정했지만 접속하지 못하는 상황(오프라인·시간 초과·오류 응답) */
const select = vi.fn();
vi.mock("./supabase.server", () => ({
  getSupabase: () => ({
    from: () => ({
      select: (...args: unknown[]) => {
        const result = select(...args);
        return Object.assign(result, {
          eq: () => ({ maybeSingle: () => select(...args) }),
        });
      },
      insert: () => Promise.reject(new TypeError("fetch failed")),
    }),
  }),
}));

const { createRepository } = await import("./repository.server");
const { isUsingFallbackData } = await import("./data-source.server");

type Item = { slug: string; name: string };

const repository = createRepository<"pantheons", Item>({
  table: "pantheons",
  mockKey: "repository-fallback-test",
  keyColumn: "slug",
  keyOf: (item) => item.slug,
  seed: [{ slug: "zeus", name: "제우스" }],
  toRow: (item) => item as never,
  fromRow: (row) => ({ slug: row.slug, name: row.name }),
});

afterEach(() => {
  select.mockReset();
  vi.restoreAllMocks();
});

describe("createRepository (Supabase를 읽지 못할 때)", () => {
  it("네트워크 오류면 내장 데이터로 대신 보여 주고, 다시 읽히면 안내를 거둡니다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    select.mockReturnValue(Promise.reject(new TypeError("fetch failed")));

    expect(await repository.list()).toEqual([{ slug: "zeus", name: "제우스" }]);
    expect((await repository.find("zeus"))?.name).toBe("제우스");
    expect(isUsingFallbackData()).toBe(true);
    expect(repository.servingFallback()).toBe(true);

    select.mockReturnValue(
      Promise.resolve({ data: [{ slug: "hera", name: "헤라" }], error: null }),
    );
    expect(await repository.list()).toEqual([{ slug: "hera", name: "헤라" }]);
    expect(isUsingFallbackData()).toBe(false);
    expect(repository.servingFallback()).toBe(false);
  });

  it("오류 응답도 내장 데이터로 대신합니다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    select.mockReturnValue(Promise.resolve({ data: null, error: { message: "timeout" } }));

    expect(await repository.list()).toHaveLength(1);
    expect(isUsingFallbackData()).toBe(true);
  });

  it("쓰기는 대신하지 않고 실패합니다", async () => {
    await expect(repository.insert({ slug: "hera", name: "헤라" })).rejects.toThrow();
  });
});
