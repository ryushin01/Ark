import type { FigureKind } from "@/entities/figure";
import type { Continent } from "@/entities/pantheon";
import type { FigureCard } from "@/widgets/figure-grid";

/** 찾기 대상 한 명. 카드에 보일 정보와 찾을 때 쓰는 정보를 함께 둡니다. */
export type SearchItem = FigureCard & {
  domains: string[];
  pantheonName: string;
  continent: Continent;
  kind: FigureKind;
};

/** 대소문자, 띄어쓰기, 유니코드 조합 차이를 없앱니다. ("Odin"과 "odin", "바바 야가"와 "바바야가") */
function normalize(text: string) {
  return text.normalize("NFC").toLowerCase().replace(/\s+/g, "");
}

/** 이름(한글·영문), 별칭, 분류, 관장 영역, 계열 이름 가운데 하나라도 검색어를 포함하면 맞습니다. */
export function matches(item: SearchItem, query: string) {
  const needle = normalize(query);
  if (!needle) return true;
  return [
    item.name,
    item.nameEn,
    item.epithet,
    item.kindLabel,
    item.pantheonName,
    ...item.domains,
  ].some((field) => normalize(field).includes(needle));
}
