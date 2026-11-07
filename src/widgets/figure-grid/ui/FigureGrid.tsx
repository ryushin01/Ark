import Image from "next/image";
import Link from "next/link";

import styles from "./FigureGrid.module.css";

import type { ArchiveImage } from "@/shared/lib";

export type FigureCard = {
  slug: string;
  name: string;
  nameEn: string;
  epithet: string;
  image: ArchiveImage | null;
  exhibitCount: number;
};

/** 신·인물 카드 목록. 카드 전체가 신 페이지로 가는 링크입니다. */
export function FigureGrid({ figures }: { figures: FigureCard[] }) {
  return (
    <ul className={styles.grid}>
      {figures.map((figure) => (
        <li key={figure.slug}>
          <Link href={`/figures/${figure.slug}`} className={styles.card}>
            <span className={styles.media}>
              {figure.image ? (
                <Image
                  src={figure.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className={styles.image}
                />
              ) : (
                <span className={styles.empty}>자료 준비 중</span>
              )}
            </span>
            <span className={styles.name}>{figure.name}</span>
            <span className={styles.meta}>
              {figure.nameEn} · {figure.epithet}
            </span>
            <span className={styles.count}>자료 {figure.exhibitCount}점</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
