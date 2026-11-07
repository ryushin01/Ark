import { beforeEach, describe, expect, it } from "vitest";

import { createMockTable } from "./mock-table";

const table = createMockTable("test-table", [{ id: "a", name: "아테나" }]);

describe("createMockTable", () => {
  beforeEach(() => table.reset());

  it("목록은 복사본이라 밖에서 바꿔도 저장된 값은 그대로입니다", () => {
    table.list()[0].name = "바뀜";
    expect(table.list()[0].name).toBe("아테나");
  });

  it("추가·수정·삭제를 반영합니다", () => {
    table.insert({ id: "b", name: "아폴론" });
    expect(table.list()).toHaveLength(2);
    table.update((row) => row.id === "b", { id: "b", name: "포이보스 아폴론" });
    expect(table.find((row) => row.id === "b")?.name).toBe("포이보스 아폴론");
    expect(table.remove((row) => row.id === "a")).toBe(true);
    expect(table.list().map((row) => row.id)).toEqual(["b"]);
  });

  it("없는 행은 수정·삭제하지 않습니다", () => {
    expect(table.update((row) => row.id === "z", { id: "z", name: "" })).toBeUndefined();
    expect(table.remove((row) => row.id === "z")).toBe(false);
  });
});
