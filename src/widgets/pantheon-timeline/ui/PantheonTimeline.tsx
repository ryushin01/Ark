"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { useScrollProgress } from "@/shared/lib";
import { RevealText } from "@/shared/ui";

import styles from "./PantheonTimeline.module.css";

import type { ArchiveImage } from "@/shared/lib";

export type TimelineItem = {
  slug: string;
  name: string;
  nameEn: string;
  eraLabel: string;
  earliestSource: string;
  summary: string;
  figureCount: number;
  cover: ArchiveImage | null;
};

/**
 * 신화 계열 연대기
 * 가장 이른 문헌의 시기 순으로 계열을 놓고, 가운데 세로선이 스크롤을 따라 내려옵니다.
 * 넓은 화면에서는 항목이 선의 왼쪽과 오른쪽에 번갈아 놓입니다.
 */
export function PantheonTimeline({ items }: { items: TimelineItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, { mode: "enter" });

  return (
    <section id="pantheons" className="px-global" aria-labelledby="pantheons-title">
      <div className={styles.head}>
        <RevealText
          as="h2"
          id="pantheons-title"
          mode="words"
          text="신화의 계열"
          className={styles.title}
        />
        <p className={styles.lead}>
          가장 오래된 기록이 남은 순서대로 여섯 계열의 신화를 모았습니다.
        </p>
      </div>

      <div ref={ref} className={styles.timeline}>
        <div className={styles.track} aria-hidden="true" />
        <div className={styles.progress} aria-hidden="true">
          <span className={styles.diamond} />
        </div>

        <ol className={styles.list}>
          {items.map((item, index) => (
            <li key={item.slug} className={styles.item} data-side={index % 2 ? "right" : "left"}>
              <p className={styles.era}>{item.eraLabel}</p>
              <Link href={`/pantheons/${item.slug}`} className={styles.card}>
                <span className={styles.media}>
                  {item.cover && (
                    <Image
                      src={item.cover.src}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, 60vw"
                      className={styles.image}
                    />
                  )}
                </span>
                <span className={styles.text}>
                  <span className={styles.nameEn} aria-hidden="true">
                    {item.nameEn}
                  </span>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.summary}>{item.summary}</span>
                  <span className={styles.meta}>
                    {item.earliestSource} · 신 {item.figureCount}명
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
