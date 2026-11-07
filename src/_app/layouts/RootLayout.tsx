import { SITE } from "@/shared/config";

import { pretendard } from "../styles/fonts";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s — ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: "ko_KR", type: "website" },
  twitter: { card: "summary_large_image" },
};

/**
 * 모든 화면의 뼈대
 * - html.js: 자바스크립트가 동작할 때만 등장 애니메이션의 시작 상태(숨김)를 적용합니다.
 *   자바스크립트가 없으면 내용이 처음부터 보입니다.
 */
export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
