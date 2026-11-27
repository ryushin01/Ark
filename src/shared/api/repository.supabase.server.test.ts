// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createFakeSupabase } from "./index.test-utils";

vi.mock("server-only", () => ({}));

/** Supabase를 연결한 상황을 메모리 가짜 클라이언트로 흉내 냅니다. */
const fake = createFakeSupabase();
vi.mock("./supabase.server", () => ({ getSupabase: () => fake.client }));

const { createRepository } = await import("./repository.server");

type Item = { slug: string; name: string };

const repository = createRepository<"pantheons", Item>({
  table: "pantheons",
  mockKey: "repository-supabase-test",
  keyColumn: "slug",
  keyOf: (item) => item.slug,
  seed: [{ slug: "seed", name: "시드" }],
  // 테스트용 최소 행이라 필수 컬럼을 다 채우지 않습니다.
  toRow: (item) => ({ slug: item.slug, name: item.name }) as never,
  fromRow: (row) => ({ slug: row.slug, name: row.name }),
});

beforeEach(() => {
  fake.reset();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("createRepository (Supabase 연결)", () => {
  it("넣은 행을 목록과 키로 읽고, 없는 키는 null입니다", async () => {
    expect(await repository.insert({ slug: "zeus", name: "제우스" })).toEqual({
      slug: "zeus",
      name: "제우스",
    });
    expect(await repository.list()).toEqual([{ slug: "zeus", name: "제우스" }]);
    expect(await repository.find("zeus")).toEqual({ slug: "zeus", name: "제우스" });
    expect(await repository.find("none")).toBeNull();
    expect(repository.servingFallback()).toBe(false);
  });

  it("같은 키를 다시 넣으면 duplicate입니다", async () => {
    await repository.insert({ slug: "zeus", name: "제우스" });
    expect(await repository.insert({ slug: "zeus", name: "다른 제우스" })).toBe("duplicate");
  });

  it("고치고 지웁니다. 없는 키는 null·false입니다", async () => {
    await repository.insert({ slug: "zeus", name: "제우스" });
    expect(await repository.update("zeus", { slug: "zeus", name: "번개의 신" })).toEqual({
      slug: "zeus",
      name: "번개의 신",
    });
    expect((await repository.find("zeus"))?.name).toBe("번개의 신");
    expect(await repository.update("none", { slug: "none", name: "" })).toBeNull();
    expect(await repository.remove("zeus")).toBe(true);
    expect(await repository.remove("zeus")).toBe(false);
  });

  it("키로 읽다가 오류가 나면 시드로 대신합니다", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    fake.fail("select", { message: "timeout" });
    expect(await repository.find("seed")).toEqual({ slug: "seed", name: "시드" });
    expect(await repository.find("none")).toBeNull();
    expect(repository.servingFallback()).toBe(true);
  });

  it("쓰기 오류는 대신하지 않고 예외를 던집니다", async () => {
    fake.fail("insert", { code: "42501", message: "권한 없음" });
    await expect(repository.insert({ slug: "hera", name: "헤라" })).rejects.toThrow(/권한 없음/);
    fake.fail("update", { message: "고칠 수 없음" });
    await expect(repository.update("hera", { slug: "hera", name: "헤라" })).rejects.toThrow(
      /고칠 수 없음/,
    );
    fake.fail("delete", { message: "지울 수 없음" });
    await expect(repository.remove("hera")).rejects.toThrow(/지울 수 없음/);
  });
});
