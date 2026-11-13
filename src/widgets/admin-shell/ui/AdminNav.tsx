"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TabNav } from "@radix-ui/themes";

const ITEMS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/pantheons", label: "신화 계열" },
  { href: "/admin/figures", label: "신·인물" },
  { href: "/admin/genealogies", label: "계보" },
  { href: "/admin/exhibits", label: "소장 자료" },
  { href: "/admin/relics", label: "유물" },
  { href: "/admin/works", label: "영향 작품" },
];

/** 어드민 메뉴. 현재 화면은 aria-current="page"로 알립니다. */
export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <TabNav.Root aria-label="관리 메뉴">
      {ITEMS.map((item) => (
        <TabNav.Link key={item.href} asChild active={isActive(item.href)}>
          <Link href={item.href}>{item.label}</Link>
        </TabNav.Link>
      ))}
    </TabNav.Root>
  );
}
