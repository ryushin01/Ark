import { features } from "@/shared/config";

export type NavItem = { href: string; label: string };

/** 사이트 메뉴. 아카이브는 기능 플래그가 켜졌을 때만 보입니다. */
export function getNavItems(): NavItem[] {
  return [
    { href: "/#pantheons", label: "계열" },
    { href: "/#figures", label: "신들" },
    ...(features.archive ? [{ href: "/archive", label: "아카이브" }] : []),
  ];
}
