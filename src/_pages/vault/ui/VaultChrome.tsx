import Link from "next/link";

import { VisuallyHidden } from "@/shared/ui";

import { SeoulClock } from "./SeoulClock";
import styles from "./VaultChrome.module.css";

import type { ReactNode } from "react";

const CREDITS_URL = "https://github.com/ryushin01/Ark#출처";

/**
 * 왼쪽 위의 워드마크와 두 줄 부제. 전시실 첫 화면에서는 페이지 제목(h1)이고,
 * 유물 상세에서는 전시실로 돌아가는 링크입니다.
 */
export function VaultMasthead({ count, heading }: { count: number; heading: boolean }) {
  const mark = (
    <>
      <span aria-hidden="true" lang="en">
        ARK VAULT
      </span>
      <VisuallyHidden>비밀 전시실</VisuallyHidden>
    </>
  );
  return (
    <div className={styles.masthead}>
      {heading ? (
        <h1 className={styles.wordmark}>{mark}</h1>
      ) : (
        <p className={styles.wordmark}>
          <Link href="/vault" className={styles.wordmarkLink}>
            {mark}
          </Link>
        </p>
      )}
      <p className={styles.pair}>
        <span className={styles.strong}>신화 속 유물의 비밀 전시실</span>
        <span className={styles.light}>{count}점의 힘과 그 대가</span>
      </p>
    </div>
  );
}

/** 오른쪽 위 메뉴: 굵은 첫 줄(전시 목록 또는 캔버스로 돌아가기)과 밑줄 링크 두 개 */
export function VaultMenu({ lead }: { lead: ReactNode }) {
  return (
    <nav className={styles.menu} aria-label="전시실 메뉴">
      {lead}
      <span className={styles.menuLinks}>
        <Link href="/figures" className={styles.underline}>
          신 찾기
        </Link>
        <Link href="/#pantheons" className={styles.underline}>
          신화 계열
        </Link>
      </span>
    </nav>
  );
}

/** 아래쪽 고정 정보: 왼쪽은 위치와 지금 시각, 가운데·오른쪽은 제작과 자료 출처 */
export function VaultFooterInfo() {
  return (
    <div className={styles.footerInfo}>
      <p className={styles.pair}>
        <span className={styles.strong}>서울, 대한민국</span>
        <span className={styles.light}>
          <SeoulClock />
        </span>
      </p>
      <p className={`${styles.pair} ${styles.credit}`}>
        <span className={styles.strong}>기획과 개발</span>
        <span className={styles.light}>ryushin01 · Ark</span>
      </p>
      <p className={`${styles.pair} ${styles.source}`}>
        <span className={styles.strong}>자료 출처</span>
        <a href={CREDITS_URL} className={`${styles.light} ${styles.underline}`}>
          위키미디어 공용 자료
        </a>
      </p>
    </div>
  );
}
