import { createRepository } from "@/shared/api/index.server";

import { MOCK_WORKS } from "./mock-data";

import type { Work, WorkMedium } from "../model/types";
import type { ArchiveImage } from "@/shared/lib";

import "server-only";

const textOrNull = (value: unknown) => (value == null ? null : String(value));

/** 영향받은 작품 저장소 (Supabase `works` 또는 메모리 목업) */
export const workRepository = createRepository<Work>({
  table: "works",
  keyColumn: "slug",
  keyOf: (work) => work.slug,
  seed: MOCK_WORKS,
  toRow: (work) => ({
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
  }),
  fromRow: (row) => ({
    slug: String(row.slug),
    title: String(row.title),
    titleOriginal: String(row.title_original),
    medium: row.medium as WorkMedium,
    year: row.year == null ? null : Number(row.year),
    creator: textOrNull(row.creator),
    summary: textOrNull(row.summary),
    figureSlugs: row.figure_slugs as string[],
    images: row.images as ArchiveImage[],
    status: row.status as Work["status"],
  }),
});
