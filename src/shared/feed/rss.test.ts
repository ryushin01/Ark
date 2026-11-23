// @vitest-environment node
import { describe, expect, it } from "vitest";

import { escapeXml, renderRss, rssChunks, toRfc822 } from "./rss";

import type { RssChannel, RssItem } from "./rss";

const CHANNEL: RssChannel = {
  title: "Ark — 세계 신화 도서관",
  link: "https://example.test/",
  description: "신화 & 유물 <도서관>",
  language: "ko",
  lastBuildDate: "2026-11-23",
  selfUrl: "https://example.test/feed.xml",
};

const ITEMS: RssItem[] = [
  {
    title: "v1.2.0 — 수정 & 정리",
    link: "https://example.test/releases/v1.2.0",
    guid: "ark-release-v1.2.0",
    pubDate: "2026-11-22",
    description: "첫 줄\n둘째 줄 <b>태그</b>",
  },
  {
    title: "v1.1.0",
    link: "https://example.test/releases/v1.1.0",
    guid: "ark-release-v1.1.0",
    pubDate: "2026-11-20",
    description: "설명",
  },
];

describe("escapeXml", () => {
  it("XML 특수 문자를 이스케이프합니다", () => {
    expect(escapeXml(`a & b < c > "d" 'e'`)).toBe(
      "a &amp; b &lt; c &gt; &quot;d&quot; &apos;e&apos;",
    );
  });

  it("XML에서 허용하지 않는 제어 문자는 지웁니다", () => {
    expect(escapeXml("가\u0000나\u0008다\n라")).toBe("가나다\n라");
  });
});

describe("toRfc822", () => {
  it("YYYY-MM-DD를 요일이 있는 RFC 822 날짜로 바꿉니다", () => {
    expect(toRfc822("2026-11-23")).toBe("Mon, 23 Nov 2026 00:00:00 GMT");
  });

  it("날짜 형식이 아니면 오류를 냅니다", () => {
    expect(() => toRfc822("11/23/2026")).toThrow();
  });
});

describe("rssChunks", () => {
  it("머리, 항목마다 한 조각, 꼬리 순서로 나눠 돌려줍니다", async () => {
    const chunks: string[] = [];
    for await (const chunk of rssChunks(CHANNEL, ITEMS)) chunks.push(chunk);
    expect(chunks).toHaveLength(ITEMS.length + 2);
    expect(chunks[0]).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(chunks[0]).toContain("<channel>");
    expect(chunks[1]).toContain("<item>");
    expect(chunks.at(-1)).toContain("</rss>");
  });

  it("비동기 항목 목록도 받습니다", async () => {
    async function* source() {
      yield* ITEMS;
    }
    const chunks: string[] = [];
    for await (const chunk of rssChunks(CHANNEL, source())) chunks.push(chunk);
    expect(chunks).toHaveLength(ITEMS.length + 2);
  });
});

describe("renderRss", () => {
  it("RSS 2.0 필수 요소와 언어를 담습니다", async () => {
    const xml = await renderRss(CHANNEL, ITEMS);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<language>ko</language>");
    expect(xml).toContain("<title>Ark — 세계 신화 도서관</title>");
    expect(xml).toContain("<link>https://example.test/</link>");
    expect(xml).toContain(
      '<atom:link href="https://example.test/feed.xml" rel="self" type="application/rss+xml"/>',
    );
    expect(xml).toContain("<lastBuildDate>Mon, 23 Nov 2026 00:00:00 GMT</lastBuildDate>");
  });

  it("항목마다 title·link·guid·pubDate·description을 갖고 값은 이스케이프됩니다", async () => {
    const xml = await renderRss(CHANNEL, ITEMS);
    expect(xml.match(/<item>/g)).toHaveLength(2);
    expect(xml).toContain("<title>v1.2.0 — 수정 &amp; 정리</title>");
    expect(xml).toContain("<link>https://example.test/releases/v1.2.0</link>");
    expect(xml).toContain('<guid isPermaLink="false">ark-release-v1.2.0</guid>');
    expect(xml).toContain("<pubDate>Sun, 22 Nov 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain("<description>첫 줄\n둘째 줄 &lt;b&gt;태그&lt;/b&gt;</description>");
    expect(xml).toContain("신화 &amp; 유물 &lt;도서관&gt;");
  });

  it("상대 주소 링크는 받지 않습니다", async () => {
    await expect(renderRss(CHANNEL, [{ ...ITEMS[0]!, link: "/releases/v1.2.0" }])).rejects.toThrow(
      /절대/,
    );
  });
});
