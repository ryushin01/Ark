/**
 * 분류
 * - god: 신
 * - hero: 영웅 (신이 아닌 인물)
 * - beast: 신수 (괴물·영수·환수)
 * - other: 그 밖의 존재 (마녀·악마·정령·수호물 등)
 */
export const FIGURE_KINDS = ["god", "hero", "beast", "other"] as const;
export type FigureKind = (typeof FIGURE_KINDS)[number];
export const FIGURE_KIND_LABEL: Record<FigureKind, string> = {
  god: "신",
  hero: "영웅",
  beast: "신수",
  other: "그 밖의 존재",
};

/** 신화 속 신·영웅·존재 */
export type Figure = {
  slug: string;
  pantheonSlug: string;
  kind: FigureKind;
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
