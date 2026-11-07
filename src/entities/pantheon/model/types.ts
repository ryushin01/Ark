/** 신화 계열 (예: 그리스 신화) */
export type Pantheon = {
  slug: string;
  name: string;
  nameEn: string;
  /** 신화가 전해진 지역 */
  region: string;
  /** 가장 이른 주요 문헌 */
  earliestSource: string;
  /** 문헌 시기 표기 (예: "기원전 8세기") */
  eraLabel: string;
  /** 정렬용 연도. 기원전은 음수 */
  eraYear: number;
  summary: string;
  description: string[];
  /** 대표 이미지로 쓸 자료 id */
  coverExhibitId: string;
};
