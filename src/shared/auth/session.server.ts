import { cookies } from "next/headers";
import { connection } from "next/server";

import { getSessionSecret, SESSION_COOKIE, verifySessionToken } from "./session";

import type { FormState } from "@/shared/lib";

import "server-only";

/** 현재 요청의 어드민 세션. 없거나 잘못되었으면 null */
export async function getAdminSession() {
  // 만료 확인에 현재 시각을 쓰므로, 미리 그리지 않고 요청 시점에 계산합니다.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, getSessionSecret());
}

/**
 * 저장 전에 부르는 권한 검사. proxy만 믿지 않고 Server Action마다 다시 확인합니다.
 * 저장할 수 없으면 폼에 보여 줄 오류 상태를, 저장할 수 있으면 null을 돌려줍니다.
 */
export async function checkWritePermission(): Promise<FormState | null> {
  const session = await getAdminSession();
  if (!session) return { status: "error", message: "로그인이 끝났습니다. 다시 로그인해 주세요." };
  if (session.role !== "admin") {
    return {
      status: "error",
      message:
        "데모 계정은 둘러보기만 할 수 있어 저장하지 않았습니다. 관리자 비밀번호로 로그인하면 저장할 수 있습니다.",
    };
  }
  return null;
}
