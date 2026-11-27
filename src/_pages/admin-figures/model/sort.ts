import sortBy from "lodash-es/sortBy";

type Sortable = { pantheonSlug: string; order: number };

/** 계열 목록의 순서대로, 같은 계열 안에서는 정해 둔 순서대로 늘어놓습니다. 목록에 없는 계열은 맨 앞에 둡니다. */
export function sortByPantheon<T extends Sortable>(
  figures: T[],
  pantheons: { slug: string }[],
): T[] {
  return sortBy(figures, [
    (figure) => pantheons.findIndex((item) => item.slug === figure.pantheonSlug),
    "order",
  ]);
}
