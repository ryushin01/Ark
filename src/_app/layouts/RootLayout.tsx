import { SITE } from "@/shared/config";

import { RestFonts } from "./RestFonts";

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
        {/* 피드 리더가 소식 피드를 자동으로 찾게 합니다. 화면마다 metadata.alternates(canonical)를 따로 두어도 빠지지 않도록 head에 직접 둡니다. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE.name} 소식`}
          href={`${SITE.url}/feed.xml`}
        />
      </head>
      <body>
        {children}
        {/* 한글 바탕: 화면 글자 파일은 globals.css와 함께 받고, 나머지 글자 조각은 페이지를 다 받은 뒤 붙임 */}
        <RestFonts href="/fonts/batang-rest.css" />
      </body>
    </html>
  );
}
