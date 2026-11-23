"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./AdminShell.module.css";

const ITEMS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/pantheons", label: "신화 계열" },
  { href: "/admin/figures", label: "신·인물" },
  { href: "/admin/genealogies", label: "계보" },
  { href: "/admin/exhibits", label: "소장 자료" },
  { href: "/admin/relics", label: "유물" },
  { href: "/admin/works", label: "영향 작품" },
];

/** 지금 화면 앞에 붙는 네 줄 빗금(장식) */
function Hatch() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.hatch}>
      <path d="M2 19 7 1M6.5 19l5-18M11 19l5-18M15.5 19l5-18" />
    </svg>
  );
}

/** 어드민 메뉴. 현재 화면은 aria-current="page"로 알리고 앞에 빗금을 붙입니다. */
export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <nav aria-label="관리 메뉴" className={styles.nav}>
      <ul className={styles.navList}>
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={styles.navLink}
                aria-current={active ? "page" : undefined}
              >
                {active && <Hatch />}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
