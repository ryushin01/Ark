import { SsgoiRouteBoundary } from "@ssgoi/react/nextjs";

import { SiteHeader } from "@/widgets/site-header";

import { SmoothScroll } from "../scroll/SmoothScroll";
import { PageTransitions } from "../transitions/PageTransitions";
import styles from "./SiteLayout.module.css";

import type { ReactNode } from "react";

/** 공개 사이트 공통 레이아웃: 본문 바로가기, 머리글, 부드러운 스크롤, 화면 전환 */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        본문 바로가기
      </a>
      <SiteHeader />
      <PageTransitions>
        <SmoothScroll />
        <main id="main" tabIndex={-1} className={styles.main}>
          <SsgoiRouteBoundary className={styles.page}>{children}</SsgoiRouteBoundary>
        </main>
      </PageTransitions>
    </>
  );
}
