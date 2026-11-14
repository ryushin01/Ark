/** 유물의 갈래 */
export const RELIC_KINDS = ["weapon", "armor", "ornament", "tool", "treasure"] as const;
export type RelicKind = (typeof RELIC_KINDS)[number];

export const RELIC_KIND_LABEL: Record<RelicKind, string> = {
  weapon: "무기",
  armor: "갑옷·방패",
  ornament: "장신구",
  tool: "도구·악기",
  treasure: "보물",
};

/**
 * 신화 속 유물: 신·영웅이 지니거나 다툰 물건
 * 힘(power)만이 아니라 어떻게 생겨났는지(origin), 그 힘이 무엇을 치르게 했는지(price)를 함께 적습니다.
 */
export type Relic = {
  slug: string;
  name: string;
  nameEn: string;
  kind: RelicKind;
  /** 지닌 이·관련 인물 (Ark의 신·인물 slug). 첫 번째가 대표 주인입니다. */
  figureSlugs: string[];
  /** 만든 이와 얻게 된 경위 */
  origin: string;
  /** 지닌 힘 */
  power: string;
  /** 이 유물 때문에 치른 대가. 전하지 않으면 null */
  price: string | null;
  /** 전하는 문헌 */
  source: string;
  /** 그림으로 쓸 소장 자료 id. 없으면 null */
  exhibitId: string | null;
  /** 전시 순서 */
  order: number;
};
