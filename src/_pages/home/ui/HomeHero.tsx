"use client";

import { useRef } from "react";
import Image from "next/image";

import { useScrollProgress } from "@/shared/lib";

import styles from "./HomeHero.module.css";

import type { ArchiveImage } from "@/shared/lib";

/** 흩어진 자료 이미지들의 시작 위치(화면 대비 %)와 크기. 스크롤하면 가운데로 모입니다. */
const TILES = [
  { x: -34, y: -26, w: 18, r: -4 },
  { x: 30, y: -30, w: 16, r: 3 },
  { x: -40, y: 22, w: 15, r: 5 },
  { x: 36, y: 24, w: 19, r: -3 },
  { x: -8, y: -38, w: 13, r: 2 },
  { x: 6, y: 36, w: 14, r: -5 },
  { x: -18, y: 4, w: 12, r: 3 },
  { x: 18, y: -2, w: 13, r: -2 },
];

type HomeHeroProps = {
  images: ArchiveImage[];
};

/**
 * 홈 첫 화면
 * 화면에 고정된 채 스크롤하는 동안, 흩어진 신화 자료 이미지가 가운데로 모이며 겹칩니다.
 * 이미지는 장식이라 대체 텍스트를 비웁니다. (자료 설명은 각 신의 페이지에 있습니다)
 */
export function HomeHero({ images }: HomeHeroProps) {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref);

  return (
    <section ref={ref} className={styles.hero} aria-labelledby="home-title">
      <div className={styles.sticky}>
        <div className={styles.stage} aria-hidden="true">
          {images.slice(0, TILES.length).map((image, index) => {
            const tile = TILES[index];
            return (
              <div
                key={image.src}
                className={styles.tile}
                style={
                  {
                    "--x": tile.x,
                    "--y": tile.y,
                    "--w": tile.w,
                    "--r": tile.r,
                    "--i": index,
                    aspectRatio: `${image.width} / ${image.height}`,
                  } as React.CSSProperties
                }
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 20vw, 40vw"
                  priority={index < 4}
                  className={styles.image}
                />
              </div>
            );
          })}
        </div>

        <div className={`${styles.overlay} px-global`}>
          <h1 id="home-title" className={styles.srOnly}>
            Ark — 세계 신화 도서관
          </h1>
          <p className={styles.wordTop} aria-hidden="true">
            World
          </p>
          <div className={styles.bottomRow}>
            <p className={styles.caption}>
              세계 신화 도서관
              <br />
              조각상·회화·유물로 읽는 신들의 기록
            </p>
            <p className={styles.wordBottom} aria-hidden="true">
              Myths
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
