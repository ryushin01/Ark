import styles from "./VisuallyHidden.module.css";

import type { ReactNode } from "react";

/** 화면에는 보이지 않고 화면 낭독기만 읽는 글입니다. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className={styles.hidden}>{children}</span>;
}
