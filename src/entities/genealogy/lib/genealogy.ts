import sumBy from "lodash-es/sumBy";
import uniqBy from "lodash-es/uniqBy";

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
  return uniqBy(
    nodes.filter((node) => keyOf(node) !== self),
    keyOf,
  ).map((node) => ({ name: node.name, nameEn: node.nameEn, slug: node.slug, note: node.note }));
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

/** 계보 속 사람 수. 맨 위 사람과 배우자, 자식을 모두 셉니다(같은 사람이 여러 번 나오면 나온 만큼). */
export const countPeople = (nodes: GenealogyNode[]): number =>
  sumBy(
    nodes,
    (node) =>
      1 +
      sumBy(node.unions ?? [], (union) => (union.partner ? 1 : 0) + countPeople(union.children)),
  );
