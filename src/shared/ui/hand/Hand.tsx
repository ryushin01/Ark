import styles from "./Hand.module.css";

import type { ReactNode } from "react";

/** 악보에 연필로 적어 둔 듯한 주석. 장식이라 보조기기에는 숨기고, 세로 띠의 주석 설정으로 끌 수 있습니다. */
export function HandNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span aria-hidden="true" className={[styles.note, className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

type MarkProps = { className?: string };

const mark = (className?: string) => [styles.mark, className].filter(Boolean).join(" ");

/** 손으로 그린 타원. 부모 크기에 맞춰 늘어납니다. */
export function HandCircle({ className }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={mark(className)}
      viewBox="0 0 120 48"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        pathLength={1}
        vectorEffect="non-scaling-stroke"
        d="M92 5C60 1 18 5 6 20c-9 12 12 24 48 25 38 1 66-9 62-24C113 9 80 3 44 6"
      />
    </svg>
  );
}

/** 글자를 지나가는 낙서 선 */
export function HandScribble({ className }: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={mark(className)}
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        pathLength={1}
        vectorEffect="non-scaling-stroke"
        d="M2 26C60 14 120 12 190 18c50 4 110-6 150-10 22-2 34 2 20 8-30 12-120 18-200 16-40-1-60-6-30-10 60-8 170-6 268-12"
      />
    </svg>
  );
}

/** 아래를 가리키는 손글씨 화살표 */
export function HandArrow({ className }: MarkProps) {
  return (
    <svg aria-hidden="true" className={mark(className)} viewBox="0 0 60 44" fill="none">
      <path pathLength={1} d="M2 12C14 4 34 0 44 8c8 7 8 20 5 32M40 31l9 10 9-11" />
    </svg>
  );
}
