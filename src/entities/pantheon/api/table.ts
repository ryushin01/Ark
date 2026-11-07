import { createRepository } from "@/shared/api/index.server";

import { MOCK_PANTHEONS } from "./mock-data";

import type { Pantheon } from "../model/types";

import "server-only";

/** 신화 계열 저장소 (Supabase `pantheons` 또는 메모리 목업) */
export const pantheonRepository = createRepository<Pantheon>({
  table: "pantheons",
  keyColumn: "slug",
  keyOf: (pantheon) => pantheon.slug,
  seed: MOCK_PANTHEONS,
  toRow: (pantheon) => ({
    slug: pantheon.slug,
    name: pantheon.name,
    name_en: pantheon.nameEn,
    region: pantheon.region,
    earliest_source: pantheon.earliestSource,
    era_label: pantheon.eraLabel,
    era_year: pantheon.eraYear,
    summary: pantheon.summary,
    description: pantheon.description,
    cover_exhibit_id: pantheon.coverExhibitId,
  }),
  fromRow: (row) => ({
    slug: String(row.slug),
    name: String(row.name),
    nameEn: String(row.name_en),
    region: String(row.region),
    earliestSource: String(row.earliest_source),
    eraLabel: String(row.era_label),
    eraYear: Number(row.era_year),
    summary: String(row.summary),
    description: row.description as string[],
    coverExhibitId: String(row.cover_exhibit_id),
  }),
});
