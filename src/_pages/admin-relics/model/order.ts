import sortBy from "lodash-es/sortBy";

/** 원래 순서에 있던 것은 그 순서대로, 없던 것은 뒤에 고른 순서대로 */
export function orderLike(selected: string[], original: string[]): string[] {
  const rank = (slug: string) => {
    const index = original.indexOf(slug);
    return index < 0 ? original.length : index;
  };
  return sortBy(selected, rank);
}
