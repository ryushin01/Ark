"use client";

import { useRef } from "react";
import Link from "next/link";

import styles from "./VaultChrome.module.css";

export type IndexGroup = {
  key: string;
  label: string;
  relics: { slug: string; name: string; no: string }[];
};

/**
 * 오른쪽 위의 '전시 목록'. 누르면 신화 계열별 전체 목록(모달 dialog)을 엽니다.
 * dialog가 초점 가두기와 Esc 닫기를 맡고, 닫으면 초점이 버튼으로 돌아옵니다.
 */
export function VaultIndex({ groups, total }: { groups: IndexGroup[]; total: number }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        className={styles.menuLead}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        전시 목록
      </button>
      <dialog ref={dialogRef} className={styles.index} aria-labelledby="vault-index-title">
        <div className={styles.indexTop}>
          <h2 id="vault-index-title" className={styles.indexTitle}>
            전시 목록 <span className={styles.indexCount}>{total}</span>
          </h2>
          <button type="button" className={styles.indexClose} onClick={close}>
            닫기
          </button>
        </div>
        <nav aria-labelledby="vault-index-title" className={styles.indexGroups}>
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`vault-group-${group.key}`}>
              <h3 id={`vault-group-${group.key}`} className={styles.groupTitle}>
                {group.label} <span className={styles.indexCount}>{group.relics.length}</span>
              </h3>
              <ol className={styles.indexList}>
                {group.relics.map((relic) => (
                  <li key={relic.slug}>
                    <Link
                      href={`/vault/${relic.slug}`}
                      className={styles.indexLink}
                      onClick={close}
                    >
                      <span className={styles.indexNo} lang="en">
                        N°{relic.no}
                      </span>
                      {relic.name}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </nav>
      </dialog>
    </>
  );
}
