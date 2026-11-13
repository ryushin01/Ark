import { createRepository } from "@/shared/api/index.server";

import { MOCK_RELICS } from "./mock-data";

import type { Relic, RelicKind } from "../model/types";

import "server-only";

/** 신화 속 유물 저장소 (Supabase `relics` 또는 메모리 목업) */
export const relicRepository = createRepository<"relics", Relic>({
  table: "relics",
  keyColumn: "slug",
  keyOf: (relic) => relic.slug,
  seed: MOCK_RELICS,
  toRow: (relic) => ({
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
  }),
  fromRow: (row) => ({
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en,
    kind: row.kind as RelicKind,
    figureSlugs: row.figure_slugs,
    origin: row.origin,
    power: row.power,
    price: row.price,
    source: row.source,
    exhibitId: row.exhibit_id,
    order: row.sort_order,
  }),
});
