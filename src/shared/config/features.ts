/**
 * 기능 플래그
 * - archive: 서브컬처 영향 아카이브. 작품 이미지의 저작권을 확인하기 전까지 꺼 둡니다.
 *   켜려면 환경 변수 NEXT_PUBLIC_FEATURE_ARCHIVE=true를 설정합니다.
 */
export const features = {
  archive: process.env.NEXT_PUBLIC_FEATURE_ARCHIVE === "true",
} as const;
