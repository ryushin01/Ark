/**
 * Wikimedia Commons 이미지의 주소·크기·라이선스·저작자를 받아 목업 데이터로 저장합니다.
 * 실행: pnpm images:resolve
 * 입력: scripts/commons-sources.json
 * 출력: public/images/exhibits/{id}.{jpg|png}, src/entities/exhibit/api/mock/commons-images.json
 * - 퍼블릭 도메인·CC 라이선스 자료만 씁니다. 라이선스가 바뀌었는지 실행 결과에서 확인합니다.
 * - Wikimedia 원본을 화면마다 직접 불러오면 요청 제한(429)에 걸리므로, 축소본을 한 번만 받아
 *   긴 변 1600px 이하의 JPEG로 다시 압축해 둡니다.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const UA = "Ark/0.1 (portfolio mythology library; https://github.com/ryushin01/Ark)";
const THUMB_WIDTH = 1280;
const ALLOWED =
  /^(Public domain|CC0|CC BY(-SA)? [\d.]+( \w+)?|No restrictions|Copyrighted free use)$/;

const root = new URL("../", import.meta.url);
const sources = JSON.parse(await readFile(new URL("scripts/commons-sources.json", root), "utf8"));

const stripHtml = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

/** "Unknown artist Unknown artist"처럼 겹친 표기와 생몰년·설명 꼬리를 정리합니다. */
const cleanArtist = (value) => {
  const name = stripHtml(value)
    .split(/ [–(]| Details on /)[0]
    .replace(/^(Creator:|Artist )/, "")
    .trim();
  const half = name.slice(0, Math.floor(name.length / 2)).trim();
  return (name === `${half} ${half}` ? half : name) || null;
};

const imageDir = new URL("public/images/exhibits/", root);
// 이미 받은 이미지는 다시 받지 않습니다. 모두 다시 받으려면 --fresh를 붙입니다.
if (process.argv.includes("--fresh")) await rm(imageDir, { recursive: true, force: true });
await mkdir(imageDir, { recursive: true });

const result = {};
for (const { id, file } of sources) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: String(THUMB_WIDTH),
    titles: `File:${file}`,
  }).toString();
  const response = await fetch(url, { headers: { "User-Agent": UA } });
  const page = Object.values((await response.json()).query.pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) throw new Error(`Commons에서 찾지 못했습니다: ${file}`);
  const meta = info.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value);
  if (!ALLOWED.test(license)) throw new Error(`허용하지 않는 라이선스(${license}): ${file}`);
  const target = new URL(`${id}.jpg`, imageDir);
  let output;
  if (existsSync(target)) {
    output = { info: await sharp(fileURLToPath(target)).metadata() };
  } else {
    const remote = (info.width > THUMB_WIDTH ? info.thumburl : info.url).split("?")[0];
    const imageResponse = await fetch(remote, { headers: { "User-Agent": UA } });
    if (!imageResponse.ok) {
      throw new Error(`이미지를 받지 못했습니다(${imageResponse.status}): ${remote}`);
    }
    output = await sharp(Buffer.from(await imageResponse.arrayBuffer()))
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    await writeFile(target, output.data);
  }
  result[id] = {
    src: `/images/exhibits/${id}.jpg`,
    width: output.info.width,
    height: output.info.height,
    license,
    licenseUrl: meta.LicenseUrl?.value ?? null,
    artist: cleanArtist(meta.Artist?.value),
    sourceUrl: info.descriptionurl,
  };
  console.log(`${id}: ${license} · ${result[id].artist ?? "-"}`);
}

await writeFile(
  new URL("src/entities/exhibit/api/mock/commons-images.json", root),
  `${JSON.stringify(result, null, 2)}\n`,
);
