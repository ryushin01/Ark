export type RssChannel = {
  title: string;
  /** 사이트 대표 주소 (절대 주소) */
  link: string;
  description: string;
  language: string;
  /** YYYY-MM-DD */
  lastBuildDate: string;
  /** 이 피드 자신의 주소 (절대 주소) */
  selfUrl: string;
};

export type RssItem = {
  title: string;
  /** 절대 주소 */
  link: string;
  /** 바뀌지 않는 고유 값 (주소 형식이 아니어도 됩니다) */
  guid: string;
  /** YYYY-MM-DD */
  pubDate: string;
  /** 순수 텍스트. 마크업은 이스케이프됩니다. */
  description: string;
};

// XML 1.0이 허용하지 않는 제어 문자 (탭·줄바꿈·캐리지 리턴은 허용)
const FORBIDDEN_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

export function escapeXml(value: string): string {
  return value
    .replace(FORBIDDEN_CONTROL, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** YYYY-MM-DD를 RFC 822 날짜(UTC 자정)로 바꿉니다. 지금 시각은 쓰지 않아 빌드마다 같은 결과가 나옵니다. */
export function toRfc822(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate))
    throw new Error(`날짜는 YYYY-MM-DD여야 합니다: ${isoDate}`);
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`올바른 날짜가 아닙니다: ${isoDate}`);
  return date.toUTCString();
}

function assertAbsolute(url: string, label: string) {
  if (!/^https?:\/\//.test(url)) throw new Error(`${label}은(는) 절대 주소여야 합니다: ${url}`);
}

function renderItem(item: RssItem): string {
  assertAbsolute(item.link, "항목 링크");
  return [
    "<item>",
    `<title>${escapeXml(item.title)}</title>`,
    `<link>${escapeXml(item.link)}</link>`,
    `<guid isPermaLink="false">${escapeXml(item.guid)}</guid>`,
    `<pubDate>${toRfc822(item.pubDate)}</pubDate>`,
    `<description>${escapeXml(item.description)}</description>`,
    "</item>\n",
  ].join("\n");
}

/**
 * RSS 2.0 문서를 머리 → 항목 하나씩 → 꼬리 순서로 나눠 돌려줍니다.
 * 항목이 많아도 문서 전체를 한 번에 만들지 않고, 항목은 동기·비동기 목록 모두 받습니다.
 */
export async function* rssChunks(
  channel: RssChannel,
  items: Iterable<RssItem> | AsyncIterable<RssItem>,
): AsyncGenerator<string, void, undefined> {
  assertAbsolute(channel.link, "채널 링크");
  assertAbsolute(channel.selfUrl, "피드 주소");
  yield [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(channel.title)}</title>`,
    `<link>${escapeXml(channel.link)}</link>`,
    `<description>${escapeXml(channel.description)}</description>`,
    `<language>${escapeXml(channel.language)}</language>`,
    `<lastBuildDate>${toRfc822(channel.lastBuildDate)}</lastBuildDate>`,
    `<atom:link href="${escapeXml(channel.selfUrl)}" rel="self" type="application/rss+xml"/>\n`,
  ].join("\n");
  for await (const item of items) yield renderItem(item);
  yield "</channel>\n</rss>\n";
}

export async function renderRss(
  channel: RssChannel,
  items: Iterable<RssItem> | AsyncIterable<RssItem>,
): Promise<string> {
  let xml = "";
  for await (const chunk of rssChunks(channel, items)) xml += chunk;
  return xml;
}
