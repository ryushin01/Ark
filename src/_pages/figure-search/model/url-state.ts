import { FIGURE_KINDS, type FigureKind } from "@/entities/figure";
import { type Continent, CONTINENTS } from "@/entities/pantheon";

export type SearchState = {
  query: string;
  continent: Continent | "all";
  kind: FigureKind | "all";
};

export const INITIAL_SEARCH: SearchState = { query: "", continent: "all", kind: "all" };

const isOneOf = <T extends string>(list: readonly T[], value: string | null): value is T =>
  value !== null && (list as readonly string[]).includes(value);

/** 주소의 ?q=&continent=&kind= 를 읽습니다. 모르는 값은 기본값으로 둡니다. */
export function parseSearch(search: string): SearchState {
  const params = new URLSearchParams(search);
  const continent = params.get("continent");
  const kind = params.get("kind");
  return {
    query: params.get("q") ?? "",
    continent: isOneOf(CONTINENTS, continent) ? continent : "all",
    kind: isOneOf(FIGURE_KINDS, kind) ? kind : "all",
  };
}

const KEYS = ["q", "continent", "kind"];

/**
 * 기본값은 빼고 주소 뒤에 붙일 문자열을 만듭니다. (예: "?q=천둥&kind=monster")
 * current를 주면 검색과 상관없는 다른 값은 그대로 둡니다.
 */
export function toSearch({ query, continent, kind }: SearchState, current = "") {
  const params = new URLSearchParams(current);
  KEYS.forEach((key) => params.delete(key));
  if (query.trim()) params.set("q", query.trim());
  if (continent !== "all") params.set("continent", continent);
  if (kind !== "all") params.set("kind", kind);
  const text = params.toString();
  return text ? `?${text}` : "";
}
