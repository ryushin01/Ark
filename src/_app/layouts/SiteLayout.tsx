import { SsgoiRouteBoundary } from "@ssgoi/react/nextjs";

import { SiteHeader } from "@/widgets/site-header";

import { ScrollRestoration } from "../scroll/ScrollRestoration";
import { SmoothScroll } from "../scroll/SmoothScroll";
import { PageTransitions } from "../transitions/PageTransitions";
import { EarlyReveal } from "./EarlyReveal";
import { EarlyRevealHandoff } from "./EarlyRevealHandoff";
import styles from "./SiteLayout.module.css";

import type { ReactNode } from "react";

/** 공개 사이트 공통 레이아웃: 본문 바로가기, 머리글, 부드러운 스크롤, 스크롤 위치 되돌리기, 화면 전환, 첫 화면 등장 효과 앞당기기 */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        본문 바로가기
      </a>
      <SiteHeader />
      <PageTransitions>
        <SmoothScroll />
        <ScrollRestoration />
        <main id="main" tabIndex={-1} className={styles.main}>
          <SsgoiRouteBoundary className={styles.page}>{children}</SsgoiRouteBoundary>
        </main>
      </PageTransitions>
      {/* 본문 HTML 뒤에 두어, 등장 효과를 자바스크립트 번들보다 먼저 시작합니다. React가 넘겨받으면 관찰을 끝냅니다. */}
      <EarlyReveal />
      <EarlyRevealHandoff />
    </>
  );
}
