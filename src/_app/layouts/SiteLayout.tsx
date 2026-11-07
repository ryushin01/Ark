import { SiteHeader } from "@/widgets/site-header";

import { SmoothScroll } from "../providers/SmoothScroll";
import styles from "./SiteLayout.module.css";

import type { ReactNode } from "react";

/** 공개 사이트 공통 레이아웃: 본문 바로가기, 머리글, 부드러운 스크롤 */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        본문 바로가기
      </a>
      <SiteHeader />
      <SmoothScroll />
      <main id="main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
    </>
  );
}
