import { describe, expect, it } from "vitest";

import { MOCK_GENEALOGIES } from "../api/mock-data";
import { findRelatives } from "./genealogy";

const getRelatives = (slug: string) => findRelatives(MOCK_GENEALOGIES, slug);

const names = (nodes: { name: string }[]) => nodes.map((node) => node.name);

describe("getRelatives", () => {
  it("부모, 배우자, 자식, 형제자매를 모읍니다", () => {
    const fenrir = getRelatives("fenrir");
    expect(names(fenrir.parents)).toEqual(["로키", "앙그르보다"]);
    expect(names(fenrir.siblings)).toEqual(["요르문간드", "헬"]);
    expect(fenrir.children).toEqual([]);
  });

  it("계보 여러 곳에 나오는 신은 합치고 같은 사람은 한 번만 남깁니다", () => {
    const zeus = getRelatives("zeus");
    expect(names(zeus.spouses)).toEqual(
      expect.arrayContaining(["레토", "데메테르", "헤라", "메티스"]),
    );
    expect(new Set(names(zeus.spouses)).size).toBe(zeus.spouses.length);
    expect(names(zeus.parents)).toEqual(["크로노스", "레아"]);
    expect(names(zeus.children)).toEqual(expect.arrayContaining(["아테나", "헤라클레스"]));
  });

  it("계보에 없는 신은 비어 있습니다", () => {
    expect(getRelatives("no-such-figure")).toEqual({
      parents: [],
      spouses: [],
      children: [],
      siblings: [],
    });
  });
});
