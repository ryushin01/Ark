"use client";

import { type ElementType, Fragment, useRef } from "react";

import { splitWords, useInView } from "@/shared/lib";

import styles from "./RevealText.module.css";

type RevealTextProps = {
  /** 렌더링할 요소. 제목이면 h1~h3, 본문이면 p */
  as?: ElementType;
  /** 보여 줄 문장 */
  text: string;
  /**
   * words: 단어마다 아래에서 떠오릅니다. (제목처럼 짧고 큰 글)
   * block: 문단 전체가 떠오릅니다. (본문)
   */
  mode?: "words" | "block";
  className?: string;
  id?: string;
};

/**
 * 화면에 들어오면 글자가 떠오르는 텍스트입니다.
 * - 자바스크립트가 없거나 사용자가 동작 줄이기를 켰으면 처음부터 그대로 보입니다.
 * - 단어를 span으로 나눠도 공백을 남기므로 화면 낭독기는 문장을 그대로 읽습니다.
 */
export function RevealText({
  as: Tag = "p",
  text,
  mode = "block",
  className,
  id,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref);
  const classNames = [styles.root, styles[mode], isInView && styles.inView, className]
    .filter(Boolean)
    .join(" ");

  if (mode === "block") {
    return (
      <Tag ref={ref} id={id} className={classNames}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} id={id} className={classNames}>
      {splitWords(text).map((word, index) => (
        // 공백을 inline-block 밖에 두어야 접근 가능한 이름에서 단어가 붙지 않습니다.
        <Fragment key={`${word}-${index}`}>
          {index > 0 && " "}
          <span className={styles.mask}>
            <span className={styles.word} style={{ "--i": index } as React.CSSProperties}>
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
