/**
 * 목업 데이터로 Supabase 시드 SQL을 만듭니다.
 * 실행: pnpm db:seed:generate → supabase/seed.sql
 * 계열과 자료가 서로를 가리키므로(대표 자료) 한 트랜잭션 안에서 넣고, 외래 키 검사는 커밋 때 합니다.
 */
import { writeFile } from "node:fs/promises";

import { MOCK_EXHIBITS } from "../src/entities/exhibit/api/mock-data";
import { MOCK_FIGURES } from "../src/entities/figure/api/mock-data";
import { MOCK_PANTHEONS } from "../src/entities/pantheon/api/mock-data";
import { MOCK_WORKS } from "../src/entities/work/api/mock-data";

const rows = {
  pantheons: MOCK_PANTHEONS.map((pantheon) => ({
    slug: pantheon.slug,
    name: pantheon.name,
    name_en: pantheon.nameEn,
    region: pantheon.region,
    continent: pantheon.continent,
    earliest_source: pantheon.earliestSource,
    era_label: pantheon.eraLabel,
    era_year: pantheon.eraYear,
    summary: pantheon.summary,
    description: pantheon.description,
    cover_exhibit_id: pantheon.coverExhibitId,
  })),
  figures: MOCK_FIGURES.map((figure) => ({
    slug: figure.slug,
    pantheon_slug: figure.pantheonSlug,
    kind: figure.kind,
    name: figure.name,
    name_en: figure.nameEn,
    epithet: figure.epithet,
    domains: figure.domains,
    summary: figure.summary,
    description: figure.description,
    sort_order: figure.order,
  })),
  exhibits: MOCK_EXHIBITS.map((exhibit) => ({
    id: exhibit.id,
    figure_slug: exhibit.figureSlug,
    title: exhibit.title,
    kind: exhibit.kind,
    date_label: exhibit.dateLabel,
    holder: exhibit.holder,
    note: exhibit.note,
    image: exhibit.image,
  })),
  works: MOCK_WORKS.map((work) => ({
    slug: work.slug,
    title: work.title,
    title_original: work.titleOriginal,
    medium: work.medium,
    year: work.year,
    creator: work.creator,
    summary: work.summary,
    figure_slugs: work.figureSlugs,
    images: work.images,
    status: work.status,
  })),
};

/** 테이블 하나를 JSON 배열에서 한 번에 넣는 SQL. 이미 있는 행은 건너뜁니다. */
function insert(table: keyof typeof rows, key: string) {
  const data = rows[table];
  const columns = Object.keys(data[0]).join(", ");
  const json = JSON.stringify(data);
  if (json.includes("$seed$"))
    throw new Error("데이터에 $seed$가 들어 있어 SQL을 만들 수 없습니다.");
  return `insert into public.${table} (${columns})
select ${columns} from jsonb_populate_recordset(null::public.${table}, $seed$${json}$seed$::jsonb)
on conflict (${key}) do nothing;`;
}

const sql = `-- 자동 생성 파일입니다. 고치지 말고 pnpm db:seed:generate로 다시 만듭니다.
begin;
set constraints all deferred;
${insert("pantheons", "slug")}
${insert("figures", "slug")}
${insert("exhibits", "id")}
${insert("works", "slug")}
commit;
`;

await writeFile(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(
  `supabase/seed.sql: 계열 ${rows.pantheons.length}, 신 ${rows.figures.length}, 자료 ${rows.exhibits.length}, 작품 ${rows.works.length}`,
);
