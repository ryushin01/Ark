import { createRepository, type Json } from "@/shared/api/index.server";

import { MOCK_EXHIBITS } from "./mock-data";

import type { Exhibit, ExhibitKind } from "../model/types";
import type { ArchiveImage } from "@/shared/lib";

import "server-only";

/** 소장 자료 저장소 (Supabase `exhibits` 또는 메모리 목업) */
export const exhibitRepository = createRepository<"exhibits", Exhibit>({
  table: "exhibits",
  keyColumn: "id",
  keyOf: (exhibit) => exhibit.id,
  seed: MOCK_EXHIBITS,
  toRow: (exhibit) => ({
    id: exhibit.id,
    figure_slug: exhibit.figureSlug,
    title: exhibit.title,
    kind: exhibit.kind,
    date_label: exhibit.dateLabel,
    holder: exhibit.holder,
    note: exhibit.note,
    image: exhibit.image as unknown as NonNullable<Json>,
  }),
  fromRow: (row) => ({
    id: row.id,
    figureSlug: row.figure_slug,
    title: row.title,
    kind: row.kind as ExhibitKind,
    dateLabel: row.date_label,
    holder: row.holder,
    note: row.note,
    image: row.image as unknown as ArchiveImage,
  }),
});
