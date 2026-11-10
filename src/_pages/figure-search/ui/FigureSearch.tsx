"use client";

import { useId, useState } from "react";

import { FIGURE_KIND_LABEL, FIGURE_KINDS, type FigureKind } from "@/entities/figure";
import { type Continent, CONTINENT_LABEL, CONTINENTS } from "@/entities/pantheon";
import { FilterGroup } from "@/shared/ui";
import { FigureGrid } from "@/widgets/figure-grid";

import { matches, type SearchItem } from "../model/search";
import styles from "./FigureSearch.module.css";

/**
 * 신·인물 찾기
 * 입력하는 대로 목록을 거르고, 결과 개수를 화면 낭독기에 알립니다.
 * 자바스크립트가 없으면 거르지 않은 전체 목록이 보입니다.
 */
export function FigureSearch({ items }: { items: SearchItem[] }) {
  const inputId = useId();
  const hintId = useId();
  const [query, setQuery] = useState("");
  const [continent, setContinent] = useState<Continent | "all">("all");

  const [kind, setKind] = useState<FigureKind | "all">("all");

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
