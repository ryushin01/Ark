import {
  buildServerErrorEnvelope,
  checkEnvelope,
  envelopeUrl,
  MAX_ENVELOPE_BYTES,
  parseDsn,
  type ServerErrorContext,
} from "./envelope";

import "server-only";

/** 서버에서 읽는 DSN. 브라우저와 같은 프로젝트로 보냅니다. */
const serverDsn = () => parseDsn(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);

/** Sentry가 느려도 응답을 오래 붙잡지 않습니다. */
const FORWARD_TIMEOUT_MS = 3000;

/**
 * 브라우저 envelope 중계 (`/api/monitoring`)
 * DSN이 없으면 404, 우리 DSN이 아니거나 너무 크면 400을 돌려줍니다.
 */
export async function forwardEnvelope(request: Request): Promise<Response> {
  const dsn = serverDsn();
  if (!dsn) return new Response(null, { status: 404 });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_ENVELOPE_BYTES) return new Response(null, { status: 413 });
  const body = await request.text();
  if (body.length > MAX_ENVELOPE_BYTES) return new Response(null, { status: 413 });
  if (!checkEnvelope(body, dsn)) return new Response(null, { status: 400 });

  try {
    const response = await fetch(envelopeUrl(dsn), {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body,
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    // 요청 한도(429) 같은 Sentry의 응답 상태를 그대로 알려 SDK가 조절하게 합니다.
    return new Response(null, { status: response.status });
  } catch {
    return new Response(null, { status: 502 });
  }
}

/** 서버 오류를 Sentry로 보냅니다. DSN이 없거나 보내지 못해도 조용히 넘어갑니다. */
export async function reportServerError(error: unknown, context: ServerErrorContext) {
  const dsn = serverDsn();
  if (!dsn) return;
  const body = buildServerErrorEnvelope(dsn, error, context, {
    eventId: crypto.randomUUID().replace(/-/g, ""),
    now: new Date(),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_RELEASE,
  });
  try {
    await fetch(envelopeUrl(dsn), {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body,
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
  } catch {
    // 오류 보고가 실패해도 요청 처리에는 영향을 주지 않습니다.
  }
}
