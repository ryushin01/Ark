/**
 * 자료 이미지 출처 목록(docs/credits.md)을 소장 자료 데이터에서 만듭니다.
 * 화면에는 출처를 적지 않고 README의 출처와 이 목록에 모아 밝힙니다.
 */
import { MOCK_EXHIBITS } from "../src/entities/exhibit/api/mock-data";

const cell = (value: string) => value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

export function renderCredits(): string {
  const rows = [...MOCK_EXHIBITS]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(({ id, title, image: { credit } }) => {
      const artist =
        credit.artist && credit.artist !== "Unknown artist" ? credit.artist : "작자 미상";
      const license = credit.licenseUrl
        ? `[${cell(credit.license)}](${credit.licenseUrl})`
        : cell(credit.license);
      return `| ${cell(title)} (\`${id}\`) | ${cell(artist)} | ${license} | [Wikimedia Commons](${credit.sourceUrl}) |`;
    });
  return `# 자료 이미지 출처

> 자동 생성 파일입니다. 고치지 말고 \`pnpm credits\`로 다시 만듭니다. (데이터: \`src/entities/exhibit/api/mock-data.ts\`, \`mock/commons-images.json\`)

Ark의 소장 자료 이미지 ${rows.length}점은 모두 Wikimedia Commons의 퍼블릭 도메인·CC0·CC BY·CC BY-SA 자료입니다. 화면 크기에 맞게 줄여(긴 변 1,600px, JPEG) 씁니다.

| 자료 | 저작자 | 사용 허락 | 원본 |
| ---- | ------ | --------- | ---- |
${rows.join("\n")}
`;
}
