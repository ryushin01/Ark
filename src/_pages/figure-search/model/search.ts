import type { FigureKind } from "@/entities/figure";
import type { Continent } from "@/entities/pantheon";
import type { FigureCard } from "@/widgets/figure-grid";

/** 찾기 대상 한 명. 카드에 보일 정보와 찾을 때 쓰는 정보를 함께 둡니다. */
export type SearchItem = FigureCard & {
  domains: string[];
  pantheonName: string;
  continent: Continent;
  kind: FigureKind;
  /** 지니거나 관련된 유물 이름(한글·영문). "묠니르"로 토르를 찾습니다. */
  relics: string[];
};

/** 대소문자, 띄어쓰기, 유니코드 조합 차이를 없앱니다. ("Odin"과 "odin", "바바 야가"와 "바바야가") */
export function normalize(text: string) {
  return text.normalize("NFC").toLowerCase().replace(/\s+/g, "");
}

const SYLLABLE_START = 0xac00;
const SYLLABLE_END = 0xd7a3;
/** 초성 순서대로의 호환용 자모 (ㄱ ㄲ ㄴ …) */
const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

const isSyllable = (code: number) => code >= SYLLABLE_START && code <= SYLLABLE_END;
const isConsonantJamo = (char: string) => CHOSEONG.includes(char);

/** 한글 음절의 초성(호환용 자모). 음절이 아니면 null */
function choseongOf(char: string) {
  const code = char.charCodeAt(0);
  return isSyllable(code) ? CHOSEONG[Math.floor((code - SYLLABLE_START) / 588)] : null;
}

/**
 * 검색어 한 글자가 대상 한 글자와 맞는지
 * - 같은 글자
 * - 초성만 쓴 글자(ㅇ)는 그 초성으로 시작하는 음절(오)과
 * - 검색어의 마지막 글자가 받침 없는 음절이면(디) 받침만 다른 음절(딘)과도 맞습니다. 입력하는 중인 글자를 위해서입니다.
 */
function charMatches(query: string, target: string, isLast: boolean) {
  if (query === target) return true;
  if (isConsonantJamo(query)) return choseongOf(target) === query;
  if (!isLast) return false;
  const q = query.charCodeAt(0) - SYLLABLE_START;
  const t = target.charCodeAt(0) - SYLLABLE_START;
  if (!isSyllable(query.charCodeAt(0)) || !isSyllable(target.charCodeAt(0))) return false;
  const hasFinal = q % 28 !== 0;
  return !hasFinal && Math.floor(q / 28) === Math.floor(t / 28);
}

/** 정규화한 대상 글에 정규화한 검색어가 (초성·입력 중인 글자를 고려해) 들어 있는지 */
export function includesKorean(target: string, needle: string) {
  const chars = [...needle];
  const text = [...target];
  for (let start = 0; start + chars.length <= text.length; start += 1) {
    if (
      chars.every((char, index) =>
        charMatches(char, text[start + index], index === chars.length - 1),
      )
    )
      return true;
  }
  return false;
}

/** 이름(한글·영문), 별칭, 분류, 관장 영역, 계열 이름, 유물 이름 가운데 하나라도 검색어와 맞으면 맞습니다. */
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
    ...item.relics,
  ].some((field) => includesKorean(normalize(field), needle));
}
