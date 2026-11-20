"use client";

import { type ElementType, Fragment, type ReactNode, useRef } from "react";

import { splitWords, useInView } from "@/shared/lib";

import styles from "./RevealText.module.css";

type RevealTextProps = {
  /** 렌더링할 요소. 제목이면 h1~h3, 본문이면 p */
  as?: ElementType;
  className?: string;
  id?: string;
} & (
  | {
      /** block: 문단 전체가 떠오릅니다. (본문) */
      mode?: "block";
      /** 보여 줄 문장. 낱말 하나에 글꼴을 따로 줄 수 있게 React 노드도 받습니다 (예: 브랜드 이름) */
      text: ReactNode;
    }
  | {
      /** words: 단어마다 아래에서 떠오릅니다. (제목처럼 짧고 큰 글) */
      mode: "words";
      /** 보여 줄 문장. 단어로 나누므로 문자열만 받습니다 */
      text: string;
    }
);

/**
 * 화면에 들어오면 글자가 떠오르는 텍스트입니다.
 * - 자바스크립트가 없거나 사용자가 동작 줄이기를 켰으면 처음부터 그대로 보입니다.
 * - 단어를 span으로 나눠도 공백을 남기므로 화면 낭독기는 문장을 그대로 읽습니다.
 * - 처음 열 때 화면에 보이는 글은 `EarlyReveal` 스크립트가 자바스크립트 번들을 기다리지 않고 바로 떠오르게 합니다.
 */
export function RevealText(props: RevealTextProps) {
  const { as: Tag = "p", className, id } = props;
  const mode = props.mode ?? "block";
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref);
  const classNames = [styles.root, styles[mode], isInView && styles.inView, className]
    .filter(Boolean)
    .join(" ");

  // data-reveal: 첫 화면의 글은 React가 넘겨받기 전에 페이지 끝의 스크립트가 먼저 보이게 합니다(data-revealed).
  // 그 속성은 서버 HTML에 없으므로 hydration 경고를 끕니다.
  if (props.mode !== "words") {
    return (
      <Tag ref={ref} id={id} className={classNames} data-reveal="" suppressHydrationWarning>
        {props.text}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} id={id} className={classNames} data-reveal="" suppressHydrationWarning>
      {splitWords(props.text).map((word, index) => (
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
