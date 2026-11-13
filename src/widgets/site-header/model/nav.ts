import { features } from "@/shared/config";

/** note: 메뉴 옆에 손글씨로 적는 짧은 주석 */
export type NavItem = { href: string; label: string; note: string };

/** 사이트 메뉴. 아카이브는 기능 플래그가 켜졌을 때만 보입니다. */
export function getNavItems(): NavItem[] {
  return [
    { href: "/#pantheons", label: "계열", note: "오래된 순서로" },
    { href: "/#figures", label: "신들", note: "한눈에" },
    { href: "/figures", label: "찾기", note: "이름으로, 영역으로" },
    { href: "/vault", label: "유물", note: "비밀 전시실" },
    ...(features.archive ? [{ href: "/archive", label: "아카이브", note: "남은 흔적" }] : []),
  ];
}
