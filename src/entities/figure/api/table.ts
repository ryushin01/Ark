import { createRepository } from "@/shared/api/index.server";

import { MOCK_FIGURES } from "./mock-data";

import type { Figure } from "../model/types";

import "server-only";

/** 신·인물 저장소 (Supabase `figures` 또는 메모리 목업) */
export const figureRepository = createRepository<Figure>({
  table: "figures",
  keyColumn: "slug",
  keyOf: (figure) => figure.slug,
  seed: MOCK_FIGURES,
  toRow: (figure) => ({
    slug: figure.slug,
    pantheon_slug: figure.pantheonSlug,
    name: figure.name,
    name_en: figure.nameEn,
    epithet: figure.epithet,
    domains: figure.domains,
    summary: figure.summary,
    description: figure.description,
    sort_order: figure.order,
  }),
  fromRow: (row) => ({
    slug: String(row.slug),
    pantheonSlug: String(row.pantheon_slug),
    name: String(row.name),
    nameEn: String(row.name_en),
    epithet: String(row.epithet),
    domains: row.domains as string[],
    summary: String(row.summary),
    description: row.description as string[],
    order: Number(row.sort_order),
  }),
});
