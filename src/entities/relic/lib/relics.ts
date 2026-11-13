import type { Relic } from "../model/types";

/** 신·인물이 지니거나 관련된 유물. 전시 순서대로 */
export function relicsOf(relics: Relic[], figureSlug: string): Relic[] {
  return relics
    .filter((relic) => relic.figureSlugs.includes(figureSlug))
    .sort((a, b) => a.order - b.order);
}

/** 앞뒤 유물(전시 동선). 처음과 끝은 이어집니다. */
export function neighborsOf(relics: Relic[], slug: string): { prev: Relic; next: Relic } | null {
  const sorted = [...relics].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((relic) => relic.slug === slug);
  if (index < 0 || sorted.length < 2) return null;
  return {
    prev: sorted[(index - 1 + sorted.length) % sorted.length],
    next: sorted[(index + 1) % sorted.length],
  };
}
