import { describe, expect, it } from "vitest";

import { orderLike } from "./order";

describe("유물 주인 순서", () => {
  it("원래 있던 주인은 원래 순서대로, 새로 고른 주인은 고른 순서대로 뒤에 둔다", () => {
    expect(orderLike(["thor", "loki", "odin", "freyja"], ["odin", "thor"])).toEqual([
      "odin",
      "thor",
      "loki",
      "freyja",
    ]);
  });

  it("원래 순서가 없으면 고른 순서를 그대로 둔다", () => {
    expect(orderLike(["b", "a", "c"], [])).toEqual(["b", "a", "c"]);
  });

  it("고른 목록을 바꾸지 않는다", () => {
    const selected = ["thor", "odin"];
    orderLike(selected, ["odin", "thor"]);
    expect(selected).toEqual(["thor", "odin"]);
  });
});
