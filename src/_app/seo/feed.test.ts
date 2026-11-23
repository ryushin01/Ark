import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { renderChangelogFeed } from "./feed";

const PACKAGE_VERSION = (
  JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")) as { version: string }
).version;

async function readFeed() {
  const markdown = readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
  return { xml: await renderChangelogFeed(markdown) };
}

describe("소식 피드(/feed.xml)", () => {
  it("올바른 XML이고 채널이 한국어입니다", async () => {
    const { xml } = await readFeed();
    const document = new DOMParser().parseFromString(xml, "application/xml");
    expect(document.querySelector("parsererror")).toBeNull();
    expect(document.documentElement.tagName).toBe("rss");
    expect(document.querySelector("channel > language")?.textContent).toBe("ko");
  });

  it("현재 버전이 가장 위 항목입니다", async () => {
    const { xml } = await readFeed();
    const document = new DOMParser().parseFromString(xml, "application/xml");
    const first = document.querySelector("item > title");
    expect(first?.textContent?.startsWith(`v${PACKAGE_VERSION}`)).toBe(true);
  });

  it("항목은 최대 30건이고 제목·링크·guid·날짜·설명이 모두 있습니다", async () => {
    const { xml } = await readFeed();
    const document = new DOMParser().parseFromString(xml, "application/xml");
    const items = [...document.querySelectorAll("item")];
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(30);
    for (const item of items) {
      for (const tag of ["title", "link", "guid", "pubDate", "description"]) {
        expect(item.querySelector(tag)?.textContent?.trim(), tag).toBeTruthy();
      }
      expect(item.querySelector("link")?.textContent).toMatch(/^https:\/\//);
    }
  });

  it("항목 guid는 서로 다릅니다", async () => {
    const { xml } = await readFeed();
    const document = new DOMParser().parseFromString(xml, "application/xml");
    const guids = [...document.querySelectorAll("item > guid")].map((node) => node.textContent);
    expect(new Set(guids).size).toBe(guids.length);
  });
});
