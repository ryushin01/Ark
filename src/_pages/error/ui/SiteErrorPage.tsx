"use client";

import { useEffect } from "react";
import Link from "next/link";

import { reportError } from "@/shared/lib";

import styles from "./SiteErrorPage.module.css";

type ErrorPageProps = { error: unknown; retry: () => void };

/**
 * 공개 사이트 오류 화면
 * 데이터베이스가 잠시 응답하지 않을 때 등. 오류 내용은 서버 기록과 맞춰 볼 수 있게 식별자(digest)만 보여 줍니다.
 */
export function SiteErrorPage({ error, retry }: ErrorPageProps) {
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  useEffect(() => {
    console.error(error);
    reportError(error);
  }, [error]);

  return (
    <section className={`${styles.page} px-global`} aria-labelledby="error-title">
      <h1 id="error-title" className={styles.title}>
        기록을 불러오지 못했습니다.
      </h1>
      <p>잠시 뒤 다시 시도해 주세요. 문제가 계속되면 처음 화면에서 다시 들어와 주세요.</p>
      {digest && <p className={styles.digest}>오류 식별자: {digest}</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => retry()}>
          다시 시도
        </button>
        <Link href="/" className={styles.link}>
          처음 화면으로 가기
        </Link>
      </div>
    </section>
  );
}
