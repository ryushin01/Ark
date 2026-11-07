// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createRepository } = await import("./repository.server");

type Item = { slug: string; name: string };

/** 환경 변수가 없으면 메모리 목업으로 동작합니다. */
const repository = createRepository<Item>({
  table: "repository-test",
  keyColumn: "slug",
  keyOf: (item) => item.slug,
  seed: [{ slug: "zeus", name: "제우스" }],
  toRow: (item) => item,
  fromRow: (row) => row as Item,
});

describe("createRepository (목업)", () => {
  it("같은 키를 다시 넣으면 duplicate입니다", async () => {
    expect(await repository.insert({ slug: "zeus", name: "다른 제우스" })).toBe("duplicate");
    expect(await repository.insert({ slug: "hera", name: "헤라" })).toEqual({
      slug: "hera",
      name: "헤라",
    });
  });

  it("고치고 지웁니다. 없는 키는 null·false입니다", async () => {
    expect(await repository.update("hera", { slug: "hera", name: "헤라 여신" })).not.toBeNull();
    expect((await repository.find("hera"))?.name).toBe("헤라 여신");
    expect(await repository.update("none", { slug: "none", name: "" })).toBeNull();
    expect(await repository.remove("hera")).toBe(true);
    expect(await repository.remove("hera")).toBe(false);
  });
});
