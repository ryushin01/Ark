import { forwardEnvelope } from "@/shared/lib/index.server";

/**
 * 브라우저 Sentry SDK의 터널(`tunnel: "/api/monitoring"`)
 * 같은 출처로 받아 Sentry로 넘기므로 CSP의 connect-src를 넓히지 않고, 광고 차단기에도 덜 막힙니다.
 */
export function POST(request: Request) {
  return forwardEnvelope(request);
}
