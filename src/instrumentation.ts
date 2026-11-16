import type { Instrumentation } from "next";

/**
 * 서버에서 난 오류(서버 컴포넌트, Route Handler, Server Action, proxy)를 Sentry로 보냅니다.
 * DSN이 없으면 아무것도 하지 않습니다. 요청 헤더·쿠키·쿼리 문자열은 보내지 않습니다.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { reportServerError } = await import("@/shared/lib/index.server");
  await reportServerError(error, {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};
