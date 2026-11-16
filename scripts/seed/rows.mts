/**
 * 목업 데이터(코드에 있는 콘텐츠)를 DB 행으로 바꿉니다.
 * root를 주면 그 폴더(다른 커밋의 작업 트리)의 목업 데이터를 읽습니다. (scripts/seed-sync.mts)
 */
import type * as Exhibit from "../../src/entities/exhibit/api/mock-data";
import type * as Figure from "../../src/entities/figure/api/mock-data";
import type * as Genealogy from "../../src/entities/genealogy/api/mock-data";
import type * as Pantheon from "../../src/entities/pantheon/api/mock-data";
import type * as Relic from "../../src/entities/relic/api/mock-data";
import type * as Work from "../../src/entities/work/api/mock-data";

/** 테이블과 기본 키. 넣는 순서이기도 합니다. */
export const TABLES = {
  pantheons: "slug",
  figures: "slug",
  exhibits: "id",
  works: "slug",
  genealogies: "pantheon_slug",
  relics: "slug",
} as const;

export type TableName = keyof typeof TABLES;
export type SeedRows = Record<TableName, Record<string, unknown>[]>;

const load = async <T,>(root: URL, entity: string): Promise<T | undefined> => {
  try {
    return (await import(new URL(`src/entities/${entity}/api/mock-data.ts`, root).href)) as T;
  } catch (error) {
    // 아직 없던 엔티티(이전 커밋)는 빈 테이블로 봅니다.
    if ((error as { code?: string }).code === "ERR_MODULE_NOT_FOUND") return undefined;
    throw error;
  }
};

export async function buildRows(root = new URL("../../", import.meta.url)): Promise<SeedRows> {
  const { MOCK_PANTHEONS = [] } = (await load<typeof Pantheon>(root, "pantheon")) ?? {};
  const { MOCK_FIGURES = [] } = (await load<typeof Figure>(root, "figure")) ?? {};
  const { MOCK_EXHIBITS = [] } = (await load<typeof Exhibit>(root, "exhibit")) ?? {};
  const { MOCK_WORKS = [] } = (await load<typeof Work>(root, "work")) ?? {};
  const { MOCK_GENEALOGIES = [] } = (await load<typeof Genealogy>(root, "genealogy")) ?? {};
  const { MOCK_RELICS = [] } = (await load<typeof Relic>(root, "relic")) ?? {};

  return {
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
      grade: figure.grade,
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
    genealogies: MOCK_GENEALOGIES.map((genealogy) => ({
      pantheon_slug: genealogy.pantheonSlug,
      source: genealogy.source,
      roots: genealogy.roots,
    })),
    relics: MOCK_RELICS.map((relic) => ({
      slug: relic.slug,
      name: relic.name,
      name_en: relic.nameEn,
      kind: relic.kind,
      figure_slugs: relic.figureSlugs,
      origin: relic.origin,
      power: relic.power,
      price: relic.price,
      source: relic.source,
      exhibit_id: relic.exhibitId,
      sort_order: relic.order,
    })),
  };
}
