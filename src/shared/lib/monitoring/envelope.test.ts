// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  buildServerErrorEnvelope,
  checkEnvelope,
  envelopeUrl,
  parseDsn,
  parseStack,
} from "./envelope";

const DSN = "https://abc123@o1.ingest.sentry.io/42";
const dsn = parseDsn(DSN)!;

const envelopeFor = (target: string) =>
  [JSON.stringify({ dsn: target, event_id: "e" }), '{"type":"event"}', "{}"].join("\n");

describe("parseDsn", () => {
  it("호스트·프로젝트·공개 키를 풀고 수신 주소를 만든다", () => {
    expect(dsn).toMatchObject({
      host: "o1.ingest.sentry.io",
      projectId: "42",
      publicKey: "abc123",
    });
    expect(envelopeUrl(dsn)).toBe("https://o1.ingest.sentry.io/api/42/envelope/");
  });

  it.each([
    undefined,
    "",
    "not a url",
    "http://k@sentry.io/1",
    "https://sentry.io/1",
    "https://k@sentry.io/x",
  ])("잘못된 값(%s)은 null", (value) => expect(parseDsn(value)).toBeNull());
});

describe("checkEnvelope", () => {
  it("우리 DSN으로 가는 envelope만 받는다", () => {
    expect(checkEnvelope(envelopeFor(DSN), dsn)).toBe(true);
    expect(checkEnvelope(envelopeFor("https://other@o1.ingest.sentry.io/42"), dsn)).toBe(false);
    expect(checkEnvelope(envelopeFor("https://abc123@evil.example/42"), dsn)).toBe(false);
    expect(checkEnvelope(envelopeFor("https://abc123@o1.ingest.sentry.io/7"), dsn)).toBe(false);
  });

  it("머리가 JSON이 아니거나 DSN이 없으면 거절한다", () => {
    expect(checkEnvelope("garbage\n{}", dsn)).toBe(false);
    expect(checkEnvelope('{"event_id":"e"}\n{}', dsn)).toBe(false);
    expect(checkEnvelope("", dsn)).toBe(false);
  });
});

describe("parseStack", () => {
  it("V8 스택을 오래된 호출부터의 프레임으로 바꾼다", () => {
    const stack = [
      "Error: boom",
      "    at load (/var/task/.next/server/chunk.js:10:5)",
      "    at /var/task/.next/server/page.js:3:1",
    ].join("\n");
    expect(parseStack(stack)).toEqual([
      { function: "<anonymous>", filename: "/var/task/.next/server/page.js", lineno: 3, colno: 1 },
      { function: "load", filename: "/var/task/.next/server/chunk.js", lineno: 10, colno: 5 },
    ]);
  });
});

describe("buildServerErrorEnvelope", () => {
  const build = (error: unknown) =>
    buildServerErrorEnvelope(
      dsn,
      error,
      {
        path: "/figures/odin?token=secret#x",
        method: "GET",
        routePath: "/figures/[slug]",
        routeType: "render",
      },
      { eventId: "a".repeat(32), now: new Date("2026-11-16T00:00:00Z"), environment: "production" },
    );

  it("머리·항목 머리·이벤트 세 줄로 만들고, 쿼리 문자열은 보내지 않는다", () => {
    const error = Object.assign(new Error("DB 연결 실패"), { digest: "123" });
    const lines = build(error).split("\n");
    expect(lines).toHaveLength(3);
    expect(JSON.parse(lines[0])).toMatchObject({ dsn: DSN, event_id: "a".repeat(32) });
    expect(JSON.parse(lines[1])).toEqual({ type: "event" });
    const event = JSON.parse(lines[2]);
    expect(event.request).toEqual({ url: "/figures/odin", method: "GET" });
    expect(event.transaction).toBe("/figures/[slug]");
    expect(event.tags).toMatchObject({ runtime: "server", digest: "123", route_type: "render" });
    expect(event.exception.values[0]).toMatchObject({
      type: "Error",
      value: "DB 연결 실패",
      mechanism: { handled: false },
    });
    expect(lines.join("\n")).not.toContain("secret");
  });

  it("Error가 아닌 값도 문자열로 보낸다", () => {
    const event = JSON.parse(build("문자열 오류").split("\n")[2]);
    expect(event.exception.values[0].value).toBe("문자열 오류");
  });
});
