import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import "server-only";

/**
 * 어드민 저장·삭제를 마칩니다. 공개 화면의 캐시를 바로 갱신하고 목록으로 돌아가 결과를 알립니다.
 * 예) finishAdminAction("figures", "/admin/figures", "saved", "odin") → /admin/figures?saved=odin
 */
export function finishAdminAction(
  tag: string,
  listPath: string,
  result: "saved" | "deleted",
  key: string,
): never {
  updateTag(tag);
  redirect(`${listPath}?${result}=${encodeURIComponent(key)}`);
}
