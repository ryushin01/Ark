"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { CreditLine } from "@/shared/ui";

import styles from "./SwipeGallery.module.css";

import type { ArchiveImage } from "@/shared/lib";

type SwipeGalleryProps = {
  /** 갤러리 이름. 화면 낭독기가 "○○ 이미지, 캐러셀"로 읽습니다. */
  label: string;
  images: ArchiveImage[];
};

/**
 * 손가락으로 밀어 넘기는 이미지 갤러리 (CSS scroll-snap)
 * - 터치: 좌우로 밀기 / 마우스·키보드: 이전·다음 버튼 (KWCAG 6.5.1 단일 포인터)
 * - 이미지가 없으면 자리표시 슬라이드 하나를 보여 줍니다.
 */
export function SwipeGallery({ label, images }: SwipeGalleryProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const total = Math.max(images.length, 1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      setCurrent(Math.min(total - 1, Math.max(0, index)));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [total]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: index * track.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      className={styles.gallery}
      aria-roledescription="캐러셀"
      aria-label={`${label} 이미지`}
    >
      <ul ref={trackRef} className={styles.track}>
        {images.length === 0 ? (
          <li className={styles.slide} aria-roledescription="슬라이드" aria-label="1 / 1">
            <div className={styles.placeholder}>
              <p>이미지 준비 중</p>
              <p className={styles.placeholderNote}>
                작품 이미지는 저작권을 확인한 뒤 출처와 함께 등록합니다.
              </p>
            </div>
          </li>
        ) : (
          images.map((image, index) => (
            <li
              key={image.src}
              className={styles.slide}
              aria-roledescription="슬라이드"
              aria-label={`${index + 1} / ${images.length}`}
            >
              <figure className={styles.figure}>
                <div className={styles.media}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className={styles.image}
                  />
                </div>
                <figcaption className={styles.credit}>
                  <CreditLine credit={image.credit} />
                </figcaption>
              </figure>
            </li>
          ))
        )}
      </ul>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
        >
          <span aria-hidden="true">←</span> 이전 이미지
        </button>
        <p className={styles.counter} aria-live="polite">
          {current + 1} / {total}
        </p>
        <button
          type="button"
          className={styles.button}
          onClick={() => goTo(current + 1)}
          disabled={current >= total - 1}
        >
          다음 이미지 <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
