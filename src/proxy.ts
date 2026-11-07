import { type NextRequest, NextResponse } from "next/server";

import { getSessionSecret, SESSION_COOKIE, verifySessionToken } from "@/shared/auth";

/**
 * /admin 접근 제어. 로그인하지 않았으면 로그인 화면으로 보냅니다.
 * 저장 권한은 Server Action에서 다시 검사합니다. (proxy만으로 보호하지 않습니다)
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    getSessionSecret(),
  );
  if (session) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
