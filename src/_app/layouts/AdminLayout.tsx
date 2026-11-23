import { Theme } from "@radix-ui/themes";

import type { ReactNode } from "react";

import "@radix-ui/themes/styles.css";
import "@/shared/ui/admin/admin-theme.css";

export const adminMetadata = {
  title: { default: "관리자", template: "%s — Ark 관리자" },
  robots: { index: false, follow: false },
};

/**
 * 어드민 전체: Radix Themes만 씁니다. (공개 사이트의 디자인을 쓰지 않습니다)
 * 색·모양은 admin-theme.css에서 먹색·밝은 회색 종이로 맞추고, 바탕은 body가 칠합니다.
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Theme
      accentColor="gray"
      grayColor="gray"
      radius="none"
      hasBackground={false}
      className="ark-admin"
    >
      {children}
    </Theme>
  );
}
