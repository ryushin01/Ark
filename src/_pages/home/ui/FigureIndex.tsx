"use client";

import { type CSSProperties, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { RevealText } from "@/shared/ui";

import styles from "./FigureIndex.module.css";

import type { ThumbImage } from "@/shared/lib";

export type FigureIndexGroup = {
  pantheonSlug: string;
  pantheonName: string;
  figures: {
    slug: string;
    name: string;
    nameEn: string;
    epithet: string;
    image: ThumbImage | null;
  }[];
};

/**
 * 모든 신·인물의 색인
 * 큰 글자 목록으로 보여 주고, 넓은 화면에서 마우스를 올리면 대표 자료 이미지가 커서를 따라다닙니다.
 * 미리보기는 장식이라 보조기기에는 숨깁니다.
 */
export function FigureIndex({ groups }: { groups: FigureIndexGroup[] }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<ThumbImage | null>(null);

  const movePreview = (event: React.PointerEvent) => {
    const element = previewRef.current;
    if (!element) return;
    element.style.translate = `${event.clientX}px ${event.clientY}px`;
  };

  return (
    <section
      id="figures"
      className={`${styles.section} px-global`}
      aria-labelledby="figures-title"
      onPointerMove={movePreview}
    >
      <RevealText
        as="h2"
        id="figures-title"
        mode="words"
        text="신과 영웅"
        className={styles.title}
      />

      <div className={styles.groups}>
        {groups.map((group) => (
          <section
            key={group.pantheonSlug}
            aria-labelledby={`index-${group.pantheonSlug}`}
            style={{ "--rows": group.figures.length } as CSSProperties}
          >
            <h3 id={`index-${group.pantheonSlug}`} className={styles.groupTitle}>
              <Link href={`/pantheons/${group.pantheonSlug}`}>{group.pantheonName}</Link>
            </h3>
            <ul className={styles.list}>
              {group.figures.map((figure) => (
                <li key={figure.slug}>
                  <Link
                    href={`/figures/${figure.slug}`}
                    className={styles.row}
                    onPointerEnter={() => setPreview(figure.image)}
                    onPointerLeave={() => setPreview(null)}
                  >
                    <span className={styles.name}>{figure.name}</span>
                    <span className={styles.nameEn} lang="en">
                      {figure.nameEn}
                    </span>
                    <span className={styles.epithet}>{figure.epithet}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div ref={previewRef} className={styles.preview} aria-hidden="true">
        {preview && (
          <div
            key={preview.src}
            className={styles.previewFrame}
            style={{ aspectRatio: `${preview.width} / ${preview.height}` }}
          >
            <Image src={preview.src} alt="" fill sizes="240px" className={styles.previewImage} />
          </div>
        )}
      </div>
    </section>
  );
}
