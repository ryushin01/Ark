import type { Relic } from "@/entities/relic";

export type RelicGroup = { key: string; label: string; relics: Relic[] };

/**
 * 전시 목록을 대표 주인(첫 번째 인물)의 신화 계열로 묶습니다.
 * 묶음은 처음 나온 순서대로, 묶음 안은 전시 순서대로입니다. 계열을 모르면 '그 밖의 전승'에 넣습니다.
 */
export function groupByPantheon(
  relics: Relic[],
  pantheonOf: (figureSlug: string) => { slug: string; name: string } | undefined,
): RelicGroup[] {
  const groups = new Map<string, RelicGroup>();
  for (const relic of [...relics].sort((a, b) => a.order - b.order)) {
    const pantheon = relic.figureSlugs[0] ? pantheonOf(relic.figureSlugs[0]) : undefined;
    const key = pantheon?.slug ?? "other";
    const group = groups.get(key) ?? { key, label: pantheon?.name ?? "그 밖의 전승", relics: [] };
    group.relics.push(relic);
    groups.set(key, group);
  }
  return [...groups.values()];
}
