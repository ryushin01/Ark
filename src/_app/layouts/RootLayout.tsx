import { SITE } from "@/shared/config";

import { FONT_FACE_CSS, FontLoader } from "./FontLoader";

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
 * 그리기 전에 실행합니다. 깜빡임 없이 자바스크립트 여부와 저장된 주석·움직임 설정을 적용합니다.
 * 저장소를 막아 둔 브라우저에서도 화면이 그려지도록 try로 감쌉니다.
 */
const INITIAL_SCRIPT = `document.documentElement.classList.add('js');try{['annotations','motion'].forEach(function(k){if(localStorage.getItem('ark-'+k)==='off')document.documentElement.dataset[k]='off'})}catch(e){}`;

/**
 * 모든 화면의 뼈대
 * - html.js: 자바스크립트가 동작할 때만 등장 애니메이션의 시작 상태(숨김)를 적용합니다.
 *   자바스크립트가 없으면 내용이 처음부터 보입니다.
 */
export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INITIAL_SCRIPT }} />
        {/* 한글 부크크 명조(통파일): 바로 받기 시작하고, 다 받을 때까지 FontLoader가 로딩 화면을 보여 줌 */}
        <link
          rel="preload"
          href="/fonts/bookk-myungjo/BookkMyungjo-Lt.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/bookk-myungjo/BookkMyungjo-Bd.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <style dangerouslySetInnerHTML={{ __html: FONT_FACE_CSS }} />
      </head>
      <body>
        <FontLoader />
        {children}
      </body>
    </html>
  );
}
