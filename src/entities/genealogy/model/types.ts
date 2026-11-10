/** 계보 속 한 사람. Ark에 있는 신·인물이면 slug로 그 화면에 이어집니다. */
export type GenealogyNode = {
  name: string;
  nameEn: string;
  slug?: string;
  /** 문헌마다 다른 전승이나 짧은 설명 */
  note?: string;
  /** 혼인(배우자와 자식). 배우자 없이 낳은 자식은 partner가 null입니다. */
  unions?: GenealogyUnion[];
};

export type GenealogyUnion = {
  partner: GenealogyNode | null;
  children: GenealogyNode[];
  note?: string;
};

/** 한 신화 계열의 계보 */
export type Genealogy = {
  pantheonSlug: string;
  /** 따른 문헌 */
  source: string;
  roots: GenealogyNode[];
};
