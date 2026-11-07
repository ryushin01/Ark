import { createRepository } from "@/shared/api/index.server";

import { MOCK_EXHIBITS } from "./mock-data";

import type { Exhibit, ExhibitKind } from "../model/types";
import type { ArchiveImage } from "@/shared/lib";

import "server-only";

const textOrNull = (value: unknown) => (value == null ? null : String(value));

/** 소장 자료 저장소 (Supabase `exhibits` 또는 메모리 목업) */
export const exhibitRepository = createRepository<Exhibit>({
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
    image: exhibit.image,
  }),
  fromRow: (row) => ({
    id: String(row.id),
    figureSlug: String(row.figure_slug),
    title: String(row.title),
    kind: row.kind as ExhibitKind,
    dateLabel: textOrNull(row.date_label),
    holder: textOrNull(row.holder),
    note: textOrNull(row.note),
    image: row.image as ArchiveImage,
  }),
});
