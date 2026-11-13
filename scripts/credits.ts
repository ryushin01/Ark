/**
 * 자료 그림 출처 전체 목록(docs/credits.md)의 내용을 자료 데이터에서 만듭니다.
 * 화면에는 그림마다의 출처를 적지 않고 README의 출처 표와 이 목록에 모읍니다.
 * 파일 쓰기는 generate-credits.mts(pnpm credits)가, 데이터와 어긋나는지는 credits.test.ts가 맡습니다.
 */
import { MOCK_EXHIBITS } from "../src/entities/exhibit/api/mock-data";
import { MOCK_FIGURES } from "../src/entities/figure/api/mock-data";
import { MOCK_PANTHEONS } from "../src/entities/pantheon/api/mock-data";

import type { ImageCredit } from "../src/shared/lib/archive-image";

export const CREDITS_PATH = "docs/credits.md";

/** 표 칸에 들어갈 글자. 줄바꿈과 칸 구분 기호(|)를 바꿉니다. */
const cell = (text: string) => text.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();

const artistOf = ({ artist }: ImageCredit) =>
  !artist || /^unknown/i.test(artist) ? "작자 미상" : cell(artist);

const licenseOf = ({ license, licenseUrl }: ImageCredit) =>
  licenseUrl ? `[${cell(license)}](${licenseUrl})` : cell(license);

export function renderCredits(): string {
  const figureBySlug = new Map(MOCK_FIGURES.map((figure) => [figure.slug, figure]));
  const groups = new Map<string, typeof MOCK_EXHIBITS>();
  for (const exhibit of MOCK_EXHIBITS) {
    const pantheonSlug = figureBySlug.get(exhibit.figureSlug)?.pantheonSlug ?? "";
    groups.set(pantheonSlug, [...(groups.get(pantheonSlug) ?? []), exhibit]);
  }

  const licenses = new Map<string, number>();
  for (const { image } of MOCK_EXHIBITS) {
    licenses.set(image.credit.license, (licenses.get(image.credit.license) ?? 0) + 1);
  }

  const lines = [
    "# 자료 그림 출처",
    "",
    `Ark가 보여 주는 자료 그림 ${MOCK_EXHIBITS.length}점의 저작자·사용 허락·원본입니다. 모두 Wikimedia Commons의 파일이며, 화면에는 그림마다의 출처를 적지 않고 [README의 출처](../README.md#출처)와 이 목록에 모읍니다. 어드민에서 더하거나 이미지·출처를 고친 자료는 데이터베이스에만 있어 이 목록에 없으므로, 그런 자료만 화면에 출처를 함께 보여 줍니다.`,
    "",
    "> 이 파일은 `pnpm credits`가 자료 데이터(`src/entities/exhibit/api/mock-data.ts`와 `mock/commons-images.json`, 시드와 같은 데이터)에서 만듭니다. 직접 고치지 말고 데이터를 고친 뒤 다시 만드세요. 데이터와 어긋나면 `scripts/credits.test.ts`가 실패합니다.",
    "",
    "| 사용 허락 | 점 |",
    "| --- | ---: |",
    ...[...licenses]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([license, count]) => `| ${cell(license)} | ${count} |`),
  ];

  const ordered = [...MOCK_PANTHEONS.map((pantheon) => pantheon.slug), ""];
  for (const slug of ordered) {
    const exhibits = groups.get(slug);
    if (!exhibits) continue;
    const name = MOCK_PANTHEONS.find((pantheon) => pantheon.slug === slug)?.name ?? "그 밖의 자료";
    lines.push(
      "",
      `## ${name}`,
      "",
      "| 자료 | 신 | 저작자 | 사용 허락 | 원본 |",
      "| --- | --- | --- | --- | --- |",
    );
    for (const { title, figureSlug, image } of exhibits) {
      const figure = figureBySlug.get(figureSlug)?.name ?? figureSlug;
      lines.push(
        `| ${cell(title)} | ${cell(figure)} | ${artistOf(image.credit)} | ${licenseOf(image.credit)} | [Commons](${image.credit.sourceUrl}) |`,
      );
    }
  }
  return `${lines.join("\n")}\n`;
}
