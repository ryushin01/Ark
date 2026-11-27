import { describe, expect, it } from "vitest";

import { sortByPantheon } from "./sort";

const pantheons = [{ slug: "egyptian" }, { slug: "greek" }];
const figure = (slug: string, pantheonSlug: string, order: number) => ({
  slug,
  pantheonSlug,
  order,
});

describe("어드민 신·인물 정렬", () => {
  it("계열 순서대로, 같은 계열 안에서는 정해 둔 순서대로 놓는다", () => {
    const figures = [
      figure("athena", "greek", 2),
      figure("ra", "egyptian", 1),
      figure("zeus", "greek", 1),
      figure("isis", "egyptian", 0),
    ];
    expect(sortByPantheon(figures, pantheons).map((item) => item.slug)).toEqual([
      "isis",
      "ra",
      "zeus",
      "athena",
    ]);
  });

  it("목록에 없는 계열은 맨 앞에 두고, 순서가 같으면 원래 순서를 지킨다", () => {
    const figures = [
      figure("zeus", "greek", 1),
      figure("odin", "norse", 0),
      figure("hera", "greek", 1),
    ];
    expect(sortByPantheon(figures, pantheons).map((item) => item.slug)).toEqual([
      "odin",
      "zeus",
      "hera",
    ]);
  });
});
