/**
 * 분류
 * - god: 신
 * - hero: 영웅 (신이 아닌 인물)
 * - monster: 몬스터 (등급으로 신수·영수·몬스터를 나눕니다)
 * - other: 그 밖의 존재 (마녀·악마·정령·수호물 등)
 */
export const FIGURE_KINDS = ["god", "hero", "monster", "other"] as const;
export type FigureKind = (typeof FIGURE_KINDS)[number];
export const FIGURE_KIND_LABEL: Record<FigureKind, string> = {
  god: "신",
  hero: "영웅",
  monster: "몬스터",
  other: "그 밖의 존재",
};

/**
 * 몬스터의 등급
 * - divine 신수: 초월적인 존재인 신에 육박하는 존재
 * - spirit 영수: 사람에 준하는 사고를 하거나, 여러 문화권에서 소개되고 추앙받는 존재 (불사조 등)
 * - common 몬스터: 그 밖의 모든 하등한 존재
 */
export const MONSTER_GRADES = ["divine", "spirit", "common"] as const;
export type MonsterGrade = (typeof MONSTER_GRADES)[number];
export const MONSTER_GRADE_LABEL: Record<MonsterGrade, string> = {
  divine: "신수",
  spirit: "영수",
  common: "몬스터",
};

/** 화면에 보일 분류 이름. 신수·영수는 등급을 함께 적습니다. (예: "몬스터 · 신수", 등급이 몬스터면 "몬스터") */
export function kindLabel({ kind, grade }: { kind: FigureKind; grade: MonsterGrade | null }) {
  return kind === "monster" && grade && grade !== "common"
    ? `${FIGURE_KIND_LABEL.monster} · ${MONSTER_GRADE_LABEL[grade]}`
    : FIGURE_KIND_LABEL[kind];
}

/** 신화 속 신·영웅·존재 */
export type Figure = {
  slug: string;
  pantheonSlug: string;
  kind: FigureKind;
  /** 몬스터일 때만 있습니다. */
  grade: MonsterGrade | null;
  name: string;
  nameEn: string;
  /** 짧은 별칭 (예: "하늘과 번개의 신") */
  epithet: string;
  /** 관장하는 영역 */
  domains: string[];
  summary: string;
  description: string[];
  /** 계열 안에서의 정렬 순서 */
  order: number;
};
