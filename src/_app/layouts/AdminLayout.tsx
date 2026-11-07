import { Theme } from "@radix-ui/themes";

import type { ReactNode } from "react";

import "@radix-ui/themes/styles.css";
import "@/shared/ui/admin/admin-theme.css";

export const adminMetadata = {
  title: { default: "관리자", template: "%s — Ark 관리자" },
  robots: { index: false, follow: false },
};

/** 어드민 전체: Radix Themes만 씁니다. (공개 사이트의 디자인을 쓰지 않습니다) */
export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Theme accentColor="brown" grayColor="sand" radius="small" className="ark-admin">
      {children}
    </Theme>
  );
}
