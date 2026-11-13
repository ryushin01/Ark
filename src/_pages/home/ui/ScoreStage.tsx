"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useMotionOff } from "@/shared/lib";
import { HandArrow, HandCircle, HandNote } from "@/shared/ui";

import styles from "./ScoreStage.module.css";

import type { ThumbImage } from "@/shared/lib";

export type ScoreMovement = {
  slug: string;
  name: string;
  nameEn: string;
  eraLabel: string;
  /** 첫 장이 대표 자료입니다. 나머지는 저작자 표기 의무가 없는 자료만 넣습니다. */
  images: ThumbImage[];
};

/** 콜라주 자리(무대 폭·높이에 대한 %). 재생선 둘레에 모입니다. */
const SLOTS = [
  { left: 6, top: 23, width: 20 },
  { left: 20, top: 13, width: 21 },
  { left: 38, top: 24, width: 15 },
  { left: 13, top: 52, width: 18 },
  { left: 32, top: 54, width: 17 },
];

const pad = (value: number) => String(value).padStart(2, "0");
const thumbRatio = ({ width, height }: ThumbImage) => Math.min(1.7, Math.max(0.6, width / height));

/**
 * 첫 화면: 악보
 * 스크롤하면 자료 필름이 가로로 흐르고, 재생선 위에 온 계열의 자료가 콜라주로 펼쳐집니다.
 * 필름의 각 묶음은 계열 화면으로 가는 링크라 키보드로도 훑을 수 있습니다.
 * 자바스크립트가 없거나 움직임을 끄면 첫 계열을 고정해 보여 주고 필름은 직접 스크롤합니다.
 */
export function ScoreStage({ movements }: { movements: ScoreMovement[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const filmRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const motionOff = useMotionOff();
  const current = movements[motionOff ? 0 : active] ?? movements[0];

  useEffect(() => {
    const section = sectionRef.current;
    const film = filmRef.current;
    if (!section || !film) return;
    if (motionOff) {
      film.style.transform = "";
      return;
    }
    const groups = [...film.children] as HTMLElement[];
    let lefts: number[] = [];
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const position = Math.min(1, Math.max(0, -rect.top / distance)) * (groups.length - 1);
      const index = Math.floor(position);
      const from = lefts[index] ?? 0;
      const to = lefts[index + 1] ?? from;
      const left = from + (to - from) * (position - index);
      film.style.transform = `translate3d(${section.clientWidth * 0.3 - left}px, -50%, 0)`;
      setActive(Math.round(position));
    };
    const measure = () => {
      lefts = groups.map((group) => group.offsetLeft);
      update();
    };
    const request = () => {
      frame ||= requestAnimationFrame(update);
    };

    measure();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", measure);
    };
  }, [motionOff]);

  /** 키보드로 필름의 링크에 들어오면 그 계열까지 스크롤합니다. */
  const focusMovement = (index: number) => {
    const section = sectionRef.current;
    if (!section || motionOff) return;
    const distance = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + (distance * index) / Math.max(1, movements.length - 1));
  };

  if (!current) return null;

  return (
    <section
      ref={sectionRef}
      className={styles.score}
      style={{ "--movements": movements.length } as CSSProperties}
      aria-labelledby="home-title"
    >
      <div className={`${styles.stage} staff`}>
        <h1 id="home-title" className="sr-only">
          Ark — 세계 신화 도서관
        </h1>

        <HandNote className={styles.scrollNote}>
          스크롤
          <HandCircle className={styles.scrollCircle} />
        </HandNote>

        <div key={current.slug} className={styles.collage} aria-hidden="true">
          {current.images.slice(0, SLOTS.length).map((image, index) => (
            <div
              key={image.src}
              className={styles.tile}
              style={
                {
                  "--left": SLOTS[index]?.left,
                  "--top": SLOTS[index]?.top,
                  "--width": SLOTS[index]?.width,
                  "--i": index,
                  aspectRatio: `${image.width} / ${image.height}`,
                } as CSSProperties
              }
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="(min-width: 768px) 28vw, 50vw"
                loading={active === 0 ? "eager" : "lazy"}
                className={styles.tileImage}
              />
            </div>
          ))}
        </div>

        <div className={styles.playhead} aria-hidden="true" />

        <p className={styles.title} aria-hidden="true">
          <span lang="en">{current.nameEn.toUpperCase()}</span>
          <span className={styles.titleEra}>({current.eraLabel})</span>
        </p>

        <div className={styles.filmWindow}>
          <ol ref={filmRef} className={styles.film}>
            {movements.map((movement, index) => (
              <li key={movement.slug} className={styles.group}>
                <Link
                  href={`/pantheons/${movement.slug}`}
                  className={styles.groupLink}
                  onFocus={() => focusMovement(index)}
                >
                  <span className="sr-only">{movement.name}</span>
                  {movement.images.slice(0, 3).map((image) => (
                    <span
                      key={image.src}
                      className={styles.thumb}
                      style={{ aspectRatio: thumbRatio(image) }}
                    >
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="160px"
                        className={styles.thumbImage}
                      />
                    </span>
                  ))}
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.bottom}>
          <p className={styles.counter}>
            <span>
              {pad((motionOff ? 0 : active) + 1)} / {pad(movements.length)}
            </span>
            <a href="#pantheons" className={styles.skip}>
              목록으로 건너뛰기
            </a>
          </p>
          <div className={styles.now}>
            <p>
              <span aria-hidden="true">▸ </span>
              {current.name}
            </p>
          </div>
          <div className={styles.more}>
            <HandNote className={styles.moreNote}>
              자세히
              <HandArrow className={styles.moreArrow} />
            </HandNote>
            <Link href={`/pantheons/${current.slug}`} className={styles.moreLink}>
              <span className="sr-only">{current.name} </span>계열 보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
