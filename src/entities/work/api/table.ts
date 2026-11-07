import { createRepository, type Json } from "@/shared/api/index.server";

import { MOCK_WORKS } from "./mock-data";

import type { Work, WorkMedium } from "../model/types";
import type { ArchiveImage } from "@/shared/lib";

import "server-only";

/** 영향받은 작품 저장소 (Supabase `works` 또는 메모리 목업) */
export const workRepository = createRepository<"works", Work>({
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
    images: work.images as unknown as NonNullable<Json>,
    status: work.status,
  }),
  fromRow: (row) => ({
    slug: row.slug,
    title: row.title,
    titleOriginal: row.title_original,
    medium: row.medium as WorkMedium,
    year: row.year,
    creator: row.creator,
    summary: row.summary,
    figureSlugs: row.figure_slugs,
    images: row.images as unknown as ArchiveImage[],
    status: row.status as Work["status"],
  }),
});
