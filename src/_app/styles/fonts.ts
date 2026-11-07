import localFont from "next/font/local";

/** 본문·제목 공통 글꼴. 가변 글꼴 한 파일로 모든 굵기를 씁니다. */
export const pretendard = localFont({
  src: "../../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});
