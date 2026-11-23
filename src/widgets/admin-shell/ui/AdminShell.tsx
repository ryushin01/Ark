import Link from "next/link";
import { Badge } from "@radix-ui/themes";

import { LogoutButton } from "@/features/admin-auth";
import { SITE } from "@/shared/config";
import { Logo } from "@/shared/ui/logo";

import { AdminNav } from "./AdminNav";
import styles from "./AdminShell.module.css";

import type { AdminRole } from "@/shared/auth";
import type { ReactNode } from "react";

/**
 * 어드민 공통 틀
 * - 머리글: 왼쪽 로고와 사선 뒤 작은 설명, 가운데 메뉴, 오른쪽 역할·사이트 보기·로그아웃
 * - 바닥글: 어두운 띠에 공개 사이트로 가는 큰 세리프 안내
 */
export function AdminShell({ role, children }: { role: AdminRole; children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a href="#admin-main" className={styles.skipLink}>
        본문 바로가기
      </a>
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <Link href="/admin" className={styles.brand}>
            <span aria-hidden="true" className={styles.logo}>
              <Logo label={SITE.name} />
            </span>
            <span className={styles.wordmark}>{SITE.name}</span>
            <span className="sr-only"> 관리자 첫 화면</span>
          </Link>
          <span className={styles.divider} aria-hidden="true" />
          <p className={styles.tagline}>
            세계 신화 도서관
            <br />
            관리자
          </p>
        </div>
        <AdminNav />
        <div className={styles.utilities}>
          <Badge color={role === "admin" ? "green" : "orange"} highContrast>
            {role === "admin" ? "관리자" : "데모 · 읽기 전용"}
          </Badge>
          <Link href="/" className={styles.utilityLink}>
            사이트 보기
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main id="admin-main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerLead}>
          <p className={styles.footerTitle}>
            고친 내용을
            <br />
            도서관에서 확인하세요
          </p>
          <Link href="/" className={styles.slashLink}>
            공개 사이트 열기
          </Link>
        </div>
        <div className={styles.footerMeta}>
          <p className={styles.footerLabel}>{SITE.name} · 세계 신화 도서관 관리자</p>
          <p className={styles.copyright}>저장한 내용은 콘텐츠 반영 뒤 공개 사이트에 보입니다.</p>
        </div>
      </footer>
    </div>
  );
}
