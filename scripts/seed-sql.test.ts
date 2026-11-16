import { describe, expect, it } from "vitest";

import { diffRows, transactionSql, upsertSql } from "./seed/sql.mjs";

import type { SeedRows } from "./seed/rows.mjs";

const empty: SeedRows = {
  pantheons: [],
  figures: [],
  exhibits: [],
  works: [],
  genealogies: [],
  relics: [],
};

describe("seed SQL", () => {
  it("skip은 이미 있는 행을 건너뛰고, update는 기본 키를 뺀 열을 바꾼다", () => {
    const rows = [{ slug: "odin", name: "오딘", sort_order: 1 }];
    expect(upsertSql("figures", rows, "skip")).toContain("on conflict (slug) do nothing;");
    expect(upsertSql("figures", rows, "update")).toContain(
      "on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;",
    );
    expect(upsertSql("figures", [], "update")).toBe("");
  });

  it("$seed$가 든 데이터는 거절한다", () => {
    expect(() => upsertSql("figures", [{ slug: "x", name: "$seed$" }], "skip")).toThrow();
  });

  it("넣는 순서대로 한 트랜잭션에 담고, 비었으면 빈 문자열", () => {
    const sql = transactionSql(
      { relics: [{ slug: "gungnir" }], pantheons: [{ slug: "norse" }] },
      "update",
    );
    expect(sql.startsWith("begin;\nset constraints all deferred;")).toBe(true);
    expect(sql.indexOf("public.pantheons")).toBeLessThan(sql.indexOf("public.relics"));
    expect(transactionSql({}, "update")).toBe("");
  });

  it("새로 생겼거나 바뀐 행만 고르고, 사라진 행은 따로 알린다", () => {
    const base: SeedRows = {
      ...empty,
      figures: [
        { slug: "odin", name: "오딘" },
        { slug: "thor", name: "토르" },
        { slug: "loki", name: "로키" },
      ],
    };
    const head: SeedRows = {
      ...empty,
      figures: [
        { slug: "odin", name: "오딘" },
        { slug: "thor", name: "천둥의 신 토르" },
        { slug: "freyja", name: "프레이야" },
      ],
    };
    const { changed, removed } = diffRows(base, head);
    expect(changed).toEqual({
      figures: [
        { slug: "thor", name: "천둥의 신 토르" },
        { slug: "freyja", name: "프레이야" },
      ],
    });
    expect(removed).toEqual({ figures: ["loki"] });
    expect(diffRows(head, head)).toEqual({ changed: {}, removed: {} });
  });
});
