"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SITE } from "@/shared/config";

import { getNavItems } from "../model/nav";
import styles from "./SiteHeader.module.css";

/**
 * 사이트 머리글
 * - 아래로 스크롤하면 숨고, 위로 스크롤하면 다시 나타납니다. 키보드 초점이 들어오면 항상 보입니다.
 * - 작은 화면에서는 메뉴 버튼이 전체 화면 메뉴(모달 dialog)를 엽니다. dialog가 초점 가두기와 Esc 닫기를 처리합니다.
 */
export function SiteHeader() {
  const items = getNavItems();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 8);
      setIsHidden(y > lastY && y > 120);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <header
      className={styles.header}
      data-hidden={isHidden || undefined}
      data-scrolled={isScrolled || undefined}
    >
      <div className={`${styles.bar} px-global`}>
        <Link href="/" className={styles.logo}>
          {SITE.name}
          <span className={styles.logoSub}>세계 신화 도서관</span>
        </Link>
        <nav aria-label="주 메뉴" className={styles.desktopNav}>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          type="button"
          className={styles.menuButton}
          aria-haspopup="dialog"
          onClick={() => dialogRef.current?.showModal()}
        >
          메뉴
        </button>
      </div>

      <dialog ref={dialogRef} className={styles.dialog} aria-label="메뉴">
        <div className={styles.dialogInner}>
          <div className={styles.dialogTop}>
            <span aria-hidden="true">{SITE.name}</span>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => dialogRef.current?.close()}
            >
              닫기
            </button>
          </div>
          <nav aria-label="주 메뉴">
            <ul className={styles.dialogList}>
              <li>
                <Link href="/" className={styles.dialogLink}>
                  처음으로
                </Link>
              </li>
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.dialogLink}
                    onClick={() => dialogRef.current?.close()}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </header>
  );
}
