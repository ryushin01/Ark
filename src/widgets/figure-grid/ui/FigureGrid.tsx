import Image from "next/image";
import Link from "next/link";

import { monogram } from "@/shared/lib";
import { skipsOptimization } from "@/shared/lib";

import styles from "./FigureGrid.module.css";

import type { ThumbImage } from "@/shared/lib";

export type FigureCard = {
  slug: string;
  name: string;
  nameEn: string;
  epithet: string;
  /** 분류 이름 (예: 신, 영웅, 몬스터 · 신수) */
  kindLabel: string;
  image: ThumbImage | null;
  exhibitCount: number;
};

/**
 * 신·인물 카드 목록. 카드 전체가 신 페이지로 가는 링크입니다.
 * eagerCount: 첫 화면에 보이는 카드 수(목록이 화면 맨 위 가까이 있을 때). 이 카드들의 이미지는 지연 로딩하지 않고,
 * 첫 카드는 가장 큰 요소(LCP)라 먼저 받습니다.
 */
export function FigureGrid({
  figures,
  eagerCount = 0,
}: {
  figures: FigureCard[];
  eagerCount?: number;
}) {
  return (
    <ul className={styles.grid}>
      {figures.map((figure, index) => (
        <li key={figure.slug}>
          <Link href={`/figures/${figure.slug}`} className={styles.card}>
            <span className={styles.media}>
              {figure.image ? (
                <Image
                  src={figure.image.src}
                  unoptimized={skipsOptimization(figure.image.src)}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  loading={index < eagerCount ? "eager" : "lazy"}
                  fetchPriority={index === 0 && eagerCount > 0 ? "high" : "auto"}
                  className={styles.image}
                />
              ) : (
                // 퍼블릭 도메인 그림을 찾지 못한 신의 기본 그림: 오선 위에 영문 이름 첫 글자를 새깁니다
                // (비밀 전시실의 빈 진열장과 같은 방식). "자료 0점"과 같은 내용이라 화면 낭독기에는 숨깁니다.
                // (링크 이름이 신 이름으로 시작하게)
                <span className={styles.empty} aria-hidden="true">
                  <span className={styles.glyph} lang="en">
                    {monogram(figure.nameEn)}
                  </span>
                  <span className={styles.emptyNote}>자료 준비 중</span>
                </span>
              )}
            </span>
            <span className={styles.name}>{figure.name}</span>
            <span className={styles.meta}>
              <span lang="en">{figure.nameEn}</span> · {figure.epithet}
            </span>
            <span className={styles.count}>
              {figure.kindLabel} · 자료 {figure.exhibitCount}점
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
