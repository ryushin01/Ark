/**
 * Sentry envelope 다루기 (서버 전용, 외부 의존 없음)
 * - 터널: 브라우저가 같은 출처(/api/monitoring)로 보낸 envelope을 Sentry로 넘깁니다. CSP의 connect-src 'self'를 그대로 지킵니다.
 * - 서버 오류: onRequestError에서 잡은 오류를 envelope으로 만들어 보냅니다. @sentry/nextjs 없이 fetch 한 번으로 보냅니다.
 */

export type Dsn = { host: string; projectId: string; publicKey: string; url: string };

/** DSN 문자열을 풉니다. 잘못된 값이면 null */
export function parseDsn(dsn: string | undefined): Dsn | null {
  if (!dsn) return null;
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\/+|\/+$/g, "");
    if (url.protocol !== "https:" || !url.username || !/^\d+$/.test(projectId)) return null;
    return { host: url.host, projectId, publicKey: url.username, url: dsn };
  } catch {
    return null;
  }
}

/** 이 DSN의 envelope 수신 주소 */
export const envelopeUrl = (dsn: Dsn) => `https://${dsn.host}/api/${dsn.projectId}/envelope/`;

/** 터널이 받을 envelope 크기 상한 (Sentry의 한 envelope 압축 전 상한보다 작게) */
export const MAX_ENVELOPE_BYTES = 200 * 1024;

/**
 * 터널로 받은 envelope이 우리 DSN으로 가는지 확인합니다.
 * 다른 DSN이면 거절해, 이 경로가 아무 Sentry 프로젝트로나 보내 주는 중계기가 되지 않게 합니다.
 */
export function checkEnvelope(body: string, allowed: Dsn): boolean {
  const header = body.slice(0, body.indexOf("\n") === -1 ? undefined : body.indexOf("\n"));
  try {
    const parsed = JSON.parse(header) as { dsn?: unknown };
    if (typeof parsed.dsn !== "string") return false;
    const dsn = parseDsn(parsed.dsn);
    return (
      !!dsn &&
      dsn.host === allowed.host &&
      dsn.projectId === allowed.projectId &&
      dsn.publicKey === allowed.publicKey
    );
  } catch {
    return false;
  }
}

export type ServerErrorContext = {
  /** 요청 경로. 쿼리 문자열은 보내기 전에 지웁니다. */
  path: string;
  method: string;
  routePath?: string;
  routeType?: string;
  renderSource?: string;
};

type Frame = { function?: string; filename?: string; lineno?: number; colno?: number };

/** V8 스택 문자열을 Sentry 프레임으로 바꿉니다. (Sentry는 오래된 호출부터 순서대로 받습니다) */
export function parseStack(stack: string | undefined): Frame[] {
  if (!stack) return [];
  const frames: Frame[] = [];
  for (const line of stack.split("\n").slice(1, 51)) {
    const match = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/.exec(line);
    if (!match) continue;
    const [, fn, filename, lineno, colno] = match;
    frames.push({
      function: fn || "<anonymous>",
      filename,
      lineno: Number(lineno),
      colno: Number(colno),
    });
  }
  return frames.reverse();
}

/**
 * 서버 오류 하나를 envelope 문자열로 만듭니다.
 * 요청 헤더·쿠키·쿼리 문자열은 넣지 않습니다. 오류 내용과 어느 경로에서 났는지만 보냅니다.
 */
export function buildServerErrorEnvelope(
  dsn: Dsn,
  error: unknown,
  context: ServerErrorContext,
  options: { eventId: string; now: Date; environment?: string; release?: string },
): string {
  const err = error instanceof Error ? error : new Error(String(error));
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest: unknown }).digest)
      : undefined;
  const frames = parseStack(err.stack);
  const path = context.path.split(/[?#]/)[0];
  const timestamp = options.now.toISOString();

  const event = {
    event_id: options.eventId,
    timestamp,
    platform: "node",
    level: "error",
    environment: options.environment,
    release: options.release,
    transaction: context.routePath ?? path,
    tags: {
      runtime: "server",
      method: context.method,
      ...(context.routeType ? { route_type: context.routeType } : {}),
      ...(context.renderSource ? { render_source: context.renderSource } : {}),
      ...(digest ? { digest } : {}),
    },
    request: { url: path, method: context.method },
    exception: {
      values: [
        {
          type: err.name,
          value: err.message,
          mechanism: { type: "onRequestError", handled: false },
          ...(frames.length ? { stacktrace: { frames } } : {}),
        },
      ],
    },
  };

  return [
    JSON.stringify({ event_id: options.eventId, sent_at: timestamp, dsn: dsn.url }),
    JSON.stringify({ type: "event" }),
    JSON.stringify(event),
  ].join("\n");
}
