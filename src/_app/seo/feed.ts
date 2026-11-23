import { cacheLife } from "next/cache";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { SITE } from "@/shared/config";
import { changelogEntries, renderRss, summarize, toPlainText } from "@/shared/feed";

import type { RssItem } from "@/shared/feed";

/** 피드에 싣는 최근 릴리스 수 */
const FEED_LIMIT = 30;

/** CHANGELOG를 위에서부터 읽어 최근 릴리스 몇 건만 피드 항목으로 만듭니다. (뒤쪽 오래된 절은 읽지 않습니다) */
async function* releaseItems(markdown: string): AsyncGenerator<RssItem, void, undefined> {
  let count = 0;
  for await (const entry of changelogEntries(markdown)) {
    const summary = summarize(entry.lines);
    yield {
      title: summary ? `v${entry.version} — ${summary}` : `v${entry.version}`,
      link: `${SITE.repo}/releases/tag/v${entry.version}`,
      guid: `ark-release-v${entry.version}`,
      pubDate: entry.date,
      description: entry.lines.map(toPlainText).join("\n"),
    };
    if (++count >= FEED_LIMIT) return;
  }
}

/** 변경 기록 문서(마크다운)로 RSS 2.0 문서를 만듭니다. */
export async function renderChangelogFeed(markdown: string): Promise<string> {
  const latest = await changelogEntries(markdown).next();
  if (latest.done) throw new Error("CHANGELOG.md에 버전 절이 없습니다.");
  return renderRss(
    {
      title: SITE.title,
      link: SITE.url,
      description: `${SITE.name}의 새 버전 소식(변경 기록)입니다.`,
      language: "ko",
      lastBuildDate: latest.value.date,
      selfUrl: new URL("/feed.xml", SITE.url).toString(),
    },
    releaseItems(markdown),
  );
}

/**
 * 변경 기록 파일을 읽어 피드 문서를 만들고 캐시합니다.
 * 캐시 덕분에 빌드할 때 한 번 만들어 정적 응답으로 내보내고, 배포 환경에서 파일을 매 요청마다 읽지 않습니다.
 * (CHANGELOG.md는 next.config.ts의 outputFileTracingIncludes로 이 경로의 함수에 함께 배포합니다.)
 */
async function loadFeedXml(): Promise<string> {
  "use cache";
  cacheLife("max");
  const markdown = await readFile(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
  return renderChangelogFeed(markdown);
}

/**
 * 소식 피드(RSS 2.0). 유물·인물 항목에는 추가 시점이 없어서, 날짜가 있는 변경 기록(CHANGELOG.md)을 소식으로 냅니다.
 * 빌드할 때 만들어지는 정적 응답이라 오프라인 빌드와 로컬 실행에서도 같게 동작합니다.
 */
export async function feed(): Promise<Response> {
  return new Response(await loadFeedXml(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
