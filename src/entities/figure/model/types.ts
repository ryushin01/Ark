/** 신화 속 신·영웅·존재 */
export type Figure = {
  slug: string;
  pantheonSlug: string;
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
