"use client";

import { useId, useSyncExternalStore } from "react";

import { FIGURE_KIND_LABEL, FIGURE_KINDS } from "@/entities/figure";
import { CONTINENT_LABEL, CONTINENTS } from "@/entities/pantheon";
import { FilterGroup } from "@/shared/ui";
import { FigureGrid } from "@/widgets/figure-grid";

import { matches, type SearchItem } from "../model/search";
import { parseSearch, type SearchState, toSearch } from "../model/url-state";
import styles from "./FigureSearch.module.css";

const SEARCH_EVENT = "ark:search";

/** 주소가 바뀌면 다시 그립니다. (직접 고친 주소와 뒤로·앞으로 가기) */
function subscribe(onChange: () => void) {
  window.addEventListener(SEARCH_EVENT, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(SEARCH_EVENT, onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/**
 * 신·인물 찾기
 * 입력하는 대로 목록을 거르고, 결과 개수를 화면 낭독기에 알립니다.
 * 검색어와 거르기는 주소(?q=&continent=&kind=)에 남겨, 결과를 공유하거나 뒤로 가기로 돌아올 수 있습니다.
 * 자바스크립트가 없으면 거르지 않은 전체 목록이 보입니다.
 */
export function FigureSearch({ items }: { items: SearchItem[] }) {
  const inputId = useId();
  const hintId = useId();
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const { query, continent, kind } = parseSearch(search);
  const update = (patch: Partial<SearchState>) => {
    const next = toSearch({ query, continent, kind, ...patch }, window.location.search);
    // 기록을 쌓지 않아 뒤로 가기가 글자마다 멈추지 않습니다.
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${next}`);
    window.dispatchEvent(new Event(SEARCH_EVENT));
  };
  const setQuery = (value: string) => update({ query: value });
  const setContinent = (value: SearchState["continent"]) => update({ continent: value });
  const setKind = (value: SearchState["kind"]) => update({ kind: value });

  const byQuery = items.filter((item) => matches(item, query));
  const inContinent = (item: SearchItem) => continent === "all" || item.continent === continent;
  const ofKind = (item: SearchItem) => kind === "all" || item.kind === kind;
  const shown = byQuery.filter((item) => inContinent(item) && ofKind(item));
  // 각 버튼의 개수는 다른 거르기를 적용한 상태에서 셉니다.
  const byKind = byQuery.filter(ofKind);
  const byContinent = byQuery.filter(inContinent);
  const continentOptions = [
    { value: "all" as const, label: "전체", count: byKind.length },
    ...CONTINENTS.map((value) => ({
      value,
      label: CONTINENT_LABEL[value],
      count: byKind.filter((item) => item.continent === value).length,
    })),
  ];
  const kindOptions = [
    { value: "all" as const, label: "전체", count: byContinent.length },
    ...FIGURE_KINDS.map((value) => ({
      value,
      label: FIGURE_KIND_LABEL[value],
      count: byContinent.filter((item) => item.kind === value).length,
    })),
  ];

  return (
    <>
      <search className={styles.search}>
        <form onSubmit={(event) => event.preventDefault()}>
          <label htmlFor={inputId} className={styles.label}>
            이름·별칭·영역으로 찾기
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby={hintId}
            autoComplete="off"
            className={styles.input}
          />
          <p id={hintId} className={styles.hint}>
            예: 천둥, 바다, 지혜, Odin, 그리스, 영웅
          </p>
        </form>
        <FilterGroup
          label="대륙으로 거르기"
          options={continentOptions}
          value={continent}
          onChange={setContinent}
        />
        <FilterGroup label="분류로 거르기" options={kindOptions} value={kind} onChange={setKind} />
      </search>

      <p className={styles.count} aria-live="polite">
        {shown.length > 0
          ? `신과 인물 ${shown.length}명`
          : "찾는 신이 없습니다. 다른 이름이나 영역으로 찾아 보세요."}
      </p>
      <FigureGrid figures={shown} />
    </>
  );
}
