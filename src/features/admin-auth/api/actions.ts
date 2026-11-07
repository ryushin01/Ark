"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  type AdminRole,
  createSessionToken,
  getSessionSecret,
  isPasswordCorrect,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/shared/auth";
import {
  clearFailures,
  countRecentFailures,
  getClientKey,
  MAX_FAILURES,
  recordFailure,
  WINDOW_MINUTES,
} from "@/shared/auth/index.server";

import type { FormState } from "@/shared/lib";

/** 로그인 뒤 돌아갈 주소. 어드민 안의 경로만 받아, 다른 사이트로 보내는 데 쓰이지 않게 합니다. */
export async function safeNextPath(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  return /^\/admin(\/[\w\-/?=&%.]*)?$/.test(path) && !path.startsWith("/admin/login")
    ? path
    : "/admin";
}

async function startSession(role: AdminRole, secret: string) {
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(role, secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: SESSION_MAX_AGE,
  });
}

/** 관리자 비밀번호 로그인 또는 데모 로그인 */
export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const secret = getSessionSecret();
  if (!secret) {
    return {
      status: "error",
      message: "서버에 ADMIN_SESSION_SECRET이 설정되지 않아 로그인할 수 없습니다.",
    };
  }

  if (formData.get("mode") === "demo") {
    await startSession("demo", secret);
    redirect(await safeNextPath(formData.get("next")));
  }

  const password = String(formData.get("password") ?? "");
  if (!password) {
    return {
      status: "error",
      message: "비밀번호를 입력해 주세요.",
      fieldErrors: { password: ["비밀번호를 입력해 주세요."] },
    };
  }
  // 무작위 대입을 막기 위해 같은 곳에서 15분 안에 5번 틀리면 잠급니다. (데모 로그인은 제한하지 않음)
  const clientKey = await getClientKey();
  if ((await countRecentFailures(clientKey)) >= MAX_FAILURES) {
    return {
      status: "error",
      message: `비밀번호를 ${MAX_FAILURES}번 틀려 ${WINDOW_MINUTES}분 동안 로그인할 수 없습니다. 잠시 뒤 다시 시도하거나 데모 계정으로 둘러보세요.`,
    };
  }
  if (!(await isPasswordCorrect(password, process.env.ADMIN_PASSWORD, secret))) {
    await recordFailure(clientKey);
    const left = MAX_FAILURES - (await countRecentFailures(clientKey));
    return {
      status: "error",
      message:
        left > 0
          ? `비밀번호가 맞지 않습니다. ${left}번 더 틀리면 ${WINDOW_MINUTES}분 동안 잠깁니다.`
          : `비밀번호를 ${MAX_FAILURES}번 틀려 ${WINDOW_MINUTES}분 동안 로그인할 수 없습니다.`,
      fieldErrors: { password: ["비밀번호가 맞지 않습니다."] },
    };
  }
  await clearFailures(clientKey);
  await startSession("admin", secret);
  redirect(await safeNextPath(formData.get("next")));
}

export async function logoutAction() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
