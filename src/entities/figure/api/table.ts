import { createRepository } from "@/shared/api/index.server";

import { MOCK_FIGURES } from "./mock-data";

import type { Figure, FigureKind, MonsterGrade } from "../model/types";

import "server-only";

/** 신·인물 저장소 (Supabase `figures` 또는 메모리 목업) */
export const figureRepository = createRepository<"figures", Figure>({
  table: "figures",
  keyColumn: "slug",
  keyOf: (figure) => figure.slug,
  seed: MOCK_FIGURES,
  toRow: (figure) => ({
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
  }),
  fromRow: (row) => ({
    slug: row.slug,
    pantheonSlug: row.pantheon_slug,
    kind: row.kind as FigureKind,
    grade: row.grade as MonsterGrade | null,
    name: row.name,
    nameEn: row.name_en,
    epithet: row.epithet,
    domains: row.domains,
    summary: row.summary,
    description: row.description,
    order: row.sort_order,
  }),
});
