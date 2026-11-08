"use client";

import { type CSSProperties, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { type Continent, CONTINENT_LABEL, CONTINENTS } from "@/entities/pantheon";
import { FilterGroup, HandNote, RevealText } from "@/shared/ui";

import styles from "./ScoreRows.module.css";

import type { ArchiveImage } from "@/shared/lib";

export type ScoreRow = {
  slug: string;
  name: string;
  nameEn: string;
  eraLabel: string;
  continent: Continent;
  earliestSource: string;
  figureCount: number;
  images: ArchiveImage[];
};

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * 신화 계열 목록
 * 한 계열이 오선 한 줄입니다. 오래된 기록부터 놓고, 시간이 흐를수록 자료 필름이 오른쪽으로 옮겨 갑니다.
 */
export function ScoreRows({ items }: { items: ScoreRow[] }) {
  const [continent, setContinent] = useState<Continent | "all">("all");
  const shown = continent === "all" ? items : items.filter((item) => item.continent === continent);
  const options = [
    { value: "all" as const, label: "전체", count: items.length },
    ...CONTINENTS.map((value) => ({
      value,
      label: CONTINENT_LABEL[value],
      count: items.filter((item) => item.continent === value).length,
    })).filter((option) => option.count > 0),
  ];

  return (
    <section id="pantheons" className="px-global" aria-labelledby="pantheons-title">
      <div className={styles.head}>
        <HandNote className={styles.note}>오래된 순서로</HandNote>
        <RevealText
          as="h2"
          id="pantheons-title"
          mode="words"
          text="신화의 계열"
          className={styles.title}
        />
        <p className={styles.lead}>
          가장 오래된 기록이 남은 순서대로 {items.length}개 계열의 신화를 모았습니다.
        </p>
      </div>

      <FilterGroup
        label="대륙으로 거르기"
        options={options}
        value={continent}
        onChange={setContinent}
      />
      <p className="sr-only" aria-live="polite">
        {continent === "all" ? "전체" : CONTINENT_LABEL[continent]} {shown.length}개 계열
      </p>

      <ol className={styles.list}>
        {shown.map((item, index) => (
          <li key={item.slug}>
            <Link
              href={`/pantheons/${item.slug}`}
              className={styles.row}
              style={
                { "--offset": shown.length > 1 ? index / (shown.length - 1) : 0 } as CSSProperties
              }
            >
              <span className={styles.number} aria-hidden="true">
                ({pad(index + 1)})
              </span>
              <span className={styles.text}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.meta}>
                  {item.eraLabel} · {item.earliestSource} · 신 {item.figureCount}명
                </span>
              </span>
              <span className={styles.film}>
                {item.images.map((image) => (
                  <span
                    key={image.src}
                    className={styles.thumb}
                    style={{
                      aspectRatio: Math.min(1.7, Math.max(0.6, image.width / image.height)),
                    }}
                  >
                    <Image src={image.src} alt="" fill sizes="160px" className={styles.image} />
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
