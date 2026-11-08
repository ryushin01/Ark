/**
 * 어드민 레이아웃은 Radix Themes CSS를 가져오므로 공개 API를 따로 둡니다.
 * index.ts에 함께 두면 공개 사이트도 이 CSS(압축 전 약 680KB)를 받게 됩니다.
 */
export { AdminLayout, adminMetadata } from "./layouts/AdminLayout";
export { AdminPanelLayout } from "./layouts/AdminPanelLayout";
