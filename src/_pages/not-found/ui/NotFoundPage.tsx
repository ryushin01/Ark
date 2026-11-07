import Link from "next/link";

import styles from "./NotFoundPage.module.css";

/** 없는 주소로 들어왔을 때 */
export function NotFoundPage() {
  return (
    <section className={`${styles.page} px-global`} aria-labelledby="not-found-title">
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1 id="not-found-title" className={styles.title}>
        찾는 기록이 이 도서관에 없습니다.
      </h1>
      <p>주소가 바뀌었거나 아직 공개하지 않은 자료일 수 있습니다.</p>
      <Link href="/" className={styles.link}>
        처음 화면으로 가기
      </Link>
    </section>
  );
}
