import { isUsingFallbackData } from "@/shared/api/index.server";

import styles from "./DataFallbackNotice.module.css";

/**
 * Supabase를 읽지 못해 내장 데이터로 대신 보여 줄 때의 안내 (공개 사이트)
 * 데이터를 직접 읽지 않고, 이 서버에서 앞서 읽기가 실패했는지만 봅니다.
 * 레이아웃이 데이터를 기다리면 저장 뒤 공개 화면을 다시 그릴 때 정적 생성이 깨지므로(usePathname 오류) 동기로 둡니다.
 */
export function DataFallbackNotice() {
  if (!isUsingFallbackData()) return null;
  return (
    <p role="status" className={styles.notice}>
      데이터베이스에 연결하지 못해 저장소에 든 오프라인 데이터로 표시 중입니다.
    </p>
  );
}
