"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SITE } from "@/shared/config";
import { HandNote, HandScribble } from "@/shared/ui";

import { getNavItems } from "../model/nav";
import { PreferenceToggle } from "./PreferenceToggle";
import styles from "./SiteHeader.module.css";

/**
 * 사이트 머리글
 * - 넓은 화면: 양옆의 검은 세로 띠. 왼쪽은 사이트 이름, 오른쪽은 메뉴와 화면 설정입니다.
 * - 작은 화면: 위쪽의 검은 띠
 * - 메뉴 버튼은 전체 화면 메뉴(모달 dialog)를 엽니다. dialog가 초점 가두기와 Esc 닫기를 처리합니다.
 */
export function SiteHeader() {
  const items = getNavItems();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <header>
      <div className={styles.topBar}>
        <Link href="/" className={styles.topBrand}>
          <span aria-hidden="true">▸ </span>
          {SITE.name}
        </Link>
        <button type="button" className={styles.menuButton} aria-haspopup="dialog" onClick={open}>
          메뉴
        </button>
      </div>

      <div className={`${styles.rail} ${styles.left}`}>
        <Link href="/" className={`${styles.vertical} ${styles.flip} ${styles.railLink}`}>
          <span aria-hidden="true">▸ </span>
          {SITE.name}
        </Link>
        <p className={`${styles.vertical} ${styles.flip}`}>세계 신화 도서관</p>
      </div>

      <div className={`${styles.rail} ${styles.right}`}>
        <button
          type="button"
          className={`${styles.vertical} ${styles.railLink}`}
          aria-haspopup="dialog"
          onClick={open}
        >
          메뉴
        </button>
        <div className={styles.settings}>
          <PreferenceToggle name="motion" label="움직임" />
          <PreferenceToggle name="annotations" label="주석" />
        </div>
      </div>

      <dialog ref={dialogRef} className={`${styles.dialog} theme-dark`} aria-label="메뉴">
        <div className={styles.dialogInner}>
          <div className={styles.dialogTop}>
            <Link href="/" className={styles.dialogHome} onClick={close}>
              처음으로
            </Link>
            <button type="button" className={styles.closeButton} onClick={close}>
              닫기
            </button>
          </div>
          <nav aria-label="전체 화면 메뉴">
            <ol className={styles.dialogList}>
              {items.map((item, index) => (
                <li key={item.href} className={styles.dialogItem}>
                  <Link href={item.href} className={styles.dialogLink} onClick={close}>
                    <span className={styles.dialogNumber} aria-hidden="true">
                      ({String(index + 1).padStart(2, "0")})
                    </span>
                    {item.label}
                    <HandScribble className={styles.scribble} />
                  </Link>
                  <HandNote className={styles.dialogNote}>{item.note}</HandNote>
                </li>
              ))}
            </ol>
          </nav>
          <div className={styles.dialogSettings}>
            <PreferenceToggle name="motion" label="움직임" />
            <PreferenceToggle name="annotations" label="주석" />
          </div>
        </div>
      </dialog>
    </header>
  );
}
