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

import type { FormState } from "@/shared/lib";

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
    redirect("/admin");
  }

  const password = String(formData.get("password") ?? "");
  if (!password) {
    return {
      status: "error",
      message: "비밀번호를 입력해 주세요.",
      fieldErrors: { password: ["비밀번호를 입력해 주세요."] },
    };
  }
  if (!(await isPasswordCorrect(password, process.env.ADMIN_PASSWORD, secret))) {
    return {
      status: "error",
      message: "비밀번호가 맞지 않습니다. 저장 권한이 없다면 데모 계정으로 둘러볼 수 있습니다.",
      fieldErrors: { password: ["비밀번호가 맞지 않습니다."] },
    };
  }
  await startSession("admin", secret);
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
