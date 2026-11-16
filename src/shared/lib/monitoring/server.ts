import {
  buildServerErrorEnvelope,
  checkEnvelope,
  envelopeUrl,
  MAX_ENVELOPE_BYTES,
  parseDsn,
  type ServerErrorContext,
} from "./envelope";

import "server-only";

/** 브라우저 SDK가 쓰는 DSN. 터널은 envelope 머리의 DSN이 이것과 같을 때만 넘깁니다. */
const browserDsn = () => parseDsn(process.env.NEXT_PUBLIC_SENTRY_DSN);

/** 서버 오류를 보낼 DSN. SENTRY_DSN이 있으면 서버 오류만 그 프로젝트로 보냅니다. */
const serverDsn = () => parseDsn(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);

/** Sentry가 느려도 응답을 오래 붙잡지 않습니다. */
const FORWARD_TIMEOUT_MS = 3000;

/** SDK가 요청을 늦추는 데 쓰는 Sentry 응답 헤더. 성공(200)에도 붙을 수 있습니다. */
const RATE_LIMIT_HEADERS = ["retry-after", "x-sentry-rate-limits"] as const;

/**
 * 본문을 조금씩 읽으며 바이트 수를 셉니다. 상한을 넘으면 바로 멈추고 null을 돌려줍니다.
 * Content-Length 없이 나눠 보내는(chunked) 큰 요청도 메모리에 다 올리지 않습니다.
 */
export async function readBoundedText(request: Request, limit: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > limit) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

/**
 * 브라우저 envelope 중계 (`/api/monitoring`)
 * DSN이 없으면 404, 너무 크면 413, 우리 DSN이 아니면 400을 돌려줍니다.
 * Sentry의 응답 상태와 요청 제한 헤더를 그대로 돌려줘 SDK가 보내는 빈도를 조절하게 합니다.
 */
export async function forwardEnvelope(request: Request): Promise<Response> {
  const dsn = browserDsn();
  if (!dsn) return new Response(null, { status: 404 });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_ENVELOPE_BYTES) return new Response(null, { status: 413 });
  const body = await readBoundedText(request, MAX_ENVELOPE_BYTES);
  if (body === null) return new Response(null, { status: 413 });
  if (!checkEnvelope(body, dsn)) return new Response(null, { status: 400 });

  try {
    const response = await fetch(envelopeUrl(dsn), {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body,
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    const headers = new Headers();
    for (const name of RATE_LIMIT_HEADERS) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(null, { status: response.status, headers });
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
