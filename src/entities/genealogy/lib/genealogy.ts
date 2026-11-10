import type { Genealogy, GenealogyNode } from "../model/types";

export type Relatives = {
  parents: GenealogyNode[];
  spouses: GenealogyNode[];
  children: GenealogyNode[];
  siblings: GenealogyNode[];
};

const keyOf = (node: GenealogyNode) => node.slug ?? node.name;

/** 같은 사람이 계보 여러 곳에 나와도 한 번만 남깁니다. */
function unique(nodes: GenealogyNode[], self: string) {
  const seen = new Set<string>([self]);
  return nodes
    .filter((node) => {
      const key = keyOf(node);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((node) => ({ name: node.name, nameEn: node.nameEn, slug: node.slug, note: node.note }));
}

/**
 * 신·인물의 가족: 부모, 배우자, 자식, 형제자매
 * 계보 전체에서 그 신이 나오는 모든 자리를 모아 합칩니다. (제우스처럼 여러 번 나오는 신)
 */
export function findRelatives(genealogies: Genealogy[], slug: string): Relatives {
  const parents: GenealogyNode[] = [];
  const spouses: GenealogyNode[] = [];
  const children: GenealogyNode[] = [];
  const siblings: GenealogyNode[] = [];

  const visit = (node: GenealogyNode) => {
    for (const union of node.unions ?? []) {
      const isOwner = node.slug === slug;
      const isPartner = union.partner?.slug === slug;
      if (isOwner && union.partner) spouses.push(union.partner);
      if (isPartner) spouses.push(node);
      if (isOwner || isPartner) children.push(...union.children);
      const self = union.children.find((child) => child.slug === slug);
      if (self) {
        parents.push(node, ...(union.partner ? [union.partner] : []));
        siblings.push(...union.children.filter((child) => child !== self));
      }
      union.children.forEach(visit);
    }
  };
  genealogies.forEach((genealogy) => genealogy.roots.forEach(visit));

  return {
    parents: unique(parents, slug),
    spouses: unique(spouses, slug),
    children: unique(children, slug),
    siblings: unique(siblings, slug),
  };
}
