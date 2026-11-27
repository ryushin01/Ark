import { describe, expect, it } from "vitest";

import { MOCK_GENEALOGIES } from "../api/mock-data";
import { countPeople, findRelatives } from "./genealogy";

import type { GenealogyNode } from "../model/types";

const getRelatives = (slug: string) => findRelatives(MOCK_GENEALOGIES, slug);

/** 테스트용 사람 */
const person = (name: string, rest: Partial<GenealogyNode> = {}): GenealogyNode => ({
  name,
  nameEn: name,
  ...rest,
});

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

  it("같은 사람이 여러 자리에 나와도 가족에서는 한 번만, 처음 나온 순서대로 남기고 자기 자신은 뺍니다", () => {
    const self = person("나", { slug: "me" });
    const sibling = person("언니", { slug: "sister" });
    const nameOnly = person("이름만");
    const relatives = findRelatives(
      [
        {
          pantheonSlug: "test",
          source: "",
          roots: [
            person("아버지", { unions: [{ partner: null, children: [sibling, self, nameOnly] }] }),
            person("아버지 2", {
              unions: [{ partner: null, children: [nameOnly, self, sibling] }],
            }),
          ],
        },
      ],
      "me",
    );
    expect(names(relatives.siblings)).toEqual(["언니", "이름만"]);
    expect(names(relatives.parents)).toEqual(["아버지", "아버지 2"]);
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

describe("countPeople", () => {
  it("맨 위 사람, 배우자, 자식을 모두 셉니다", () => {
    const nodes: GenealogyNode[] = [
      person("크로노스", {
        unions: [
          { partner: person("레아"), children: [person("제우스"), person("헤라")] },
          {
            partner: null,
            children: [
              person("케이론", { unions: [{ partner: null, children: [person("아이")] }] }),
            ],
          },
        ],
      }),
      person("우라노스"),
    ];
    expect(countPeople(nodes)).toBe(7);
    expect(countPeople([])).toBe(0);
  });

  it("내장 계보마다 한 명 이상을 셉니다", () => {
    for (const genealogy of MOCK_GENEALOGIES)
      expect(countPeople(genealogy.roots), genealogy.pantheonSlug).toBeGreaterThan(0);
  });
});
