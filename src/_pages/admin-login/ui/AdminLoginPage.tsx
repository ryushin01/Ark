import { Suspense } from "react";
import Link from "next/link";
import { Heading, Text } from "@radix-ui/themes";

import { LoginForm } from "@/features/admin-auth";

import styles from "./AdminLoginPage.module.css";

export const adminLoginMetadata = { title: "관리자 로그인", robots: { index: false } };

/** 어드민 로그인: 가운데 아주 큰 세리프 제목, 그 아래 가는 선으로 둘러싼 로그인 폼 */
export function AdminLoginPage() {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>세계 신화 도서관</p>
      <Heading as="h1" className={styles.title}>
        <span className={styles.titleLine}>Ark 관리자</span>
      </Heading>
      <Text as="p" className={styles.description}>
        세계 신화 도서관의 계열, 신, 자료, 작품을 관리합니다.
      </Text>
      <div className={styles.panel}>
        {/* 주소의 next 값을 읽으므로 Suspense 안에서 그립니다. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <Link href="/" className={styles.back}>
        사이트로 돌아가기
      </Link>
    </main>
  );
}
