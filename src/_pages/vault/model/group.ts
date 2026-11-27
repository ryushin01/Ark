import groupBy from "lodash-es/groupBy";
import sortBy from "lodash-es/sortBy";

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
  const ownerPantheon = (relic: Relic) =>
    relic.figureSlugs[0] ? pantheonOf(relic.figureSlugs[0]) : undefined;
  const grouped = groupBy(
    sortBy(relics, "order"),
    (relic) => ownerPantheon(relic)?.slug ?? "other",
  );
  return Object.entries(grouped).map(([key, members]) => ({
    key,
    label: ownerPantheon(members[0])?.name ?? "그 밖의 전승",
    relics: members,
  }));
}
