/**
 * 탈것·동반자: 신화에서 신·영웅(rider)이 타는 존재(mount)와 늘 곁에 두는 존재(companion).
 * 신 상세에 보여 주고, ZERO가 카드 장착 결속에 씁니다(sync:ark로 이 파일을 읽음). 모양을 바꾸면 ZERO에도 알립니다.
 * rider·partner는 Ark에 있는 신·인물의 slug입니다.
 */
const BOND_RELATIONS = ["mount", "companion"] as const;
export type BondRelation = (typeof BOND_RELATIONS)[number];

export type Bond = {
  rider: string;
  partner: string;
  relation: BondRelation;
  /** 전승이 한정적일 때 덧붙이는 설명 */
  note?: string;
};

export const BONDS: Bond[] = [
  { rider: "odin", partner: "sleipnir", relation: "mount" },
  { rider: "bellerophon", partner: "pegasus", relation: "mount" },
  {
    rider: "perseus",
    partner: "pegasus",
    relation: "mount",
    note: "고대 문헌이 아니라 중세 이후의 그림과 이야기에서",
  },
  { rider: "odin", partner: "huginn-muninn", relation: "companion" },
  { rider: "hades", partner: "cerberus", relation: "companion" },
  { rider: "change", partner: "jade-rabbit", relation: "companion" },
];

/** 신 상세에 쓰는 이름: 이 신의 탈것·동반자, 이 존재를 타거나 곁에 둔 신 */
const BOND_LABEL: Record<BondRelation, { own: string; of: string }> = {
  mount: { own: "탈것", of: "타는 이" },
  companion: { own: "동반자", of: "함께하는 이" },
};

export type BondRow = { label: string; items: { slug: string; note?: string }[] };

/** slug의 탈것·동반자와, slug를 타거나 곁에 둔 신을 관계별로 모읍니다. 없으면 빈 배열입니다. */
export function findBonds(slug: string, bonds: Bond[] = BONDS): BondRow[] {
  const rows: BondRow[] = [];
  for (const relation of BOND_RELATIONS) {
    const own = bonds.filter((bond) => bond.rider === slug && bond.relation === relation);
    if (own.length > 0)
      rows.push({
        label: BOND_LABEL[relation].own,
        items: own.map(({ partner, note }) => ({ slug: partner, note })),
      });
  }
  for (const relation of BOND_RELATIONS) {
    const of = bonds.filter((bond) => bond.partner === slug && bond.relation === relation);
    if (of.length > 0)
      rows.push({
        label: BOND_LABEL[relation].of,
        items: of.map(({ rider, note }) => ({ slug: rider, note })),
      });
  }
  return rows;
}
