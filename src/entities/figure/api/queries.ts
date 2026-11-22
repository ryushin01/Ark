import { cacheLife, cacheTag } from "next/cache";

import { figureRepository } from "./table";

import type { Figure } from "../model/types";

export const FIGURE_TAG = "figures";

export async function getFigures(): Promise<Figure[]> {
  "use cache";
  cacheTag(FIGURE_TAG);
  const rows = await figureRepository.list();
  // Supabase를 읽지 못해 내장 데이터로 대신했으면 몇 분만 캐시해, 다시 연결되면 곧 실제 데이터로 돌아갑니다.
  if (figureRepository.servingFallback()) cacheLife("minutes");
  else cacheLife("hours");
  return rows;
}

/** 한 계열에 속한 신·인물을 정해 둔 순서대로 돌려줍니다. */
export async function getFiguresByPantheon(pantheonSlug: string): Promise<Figure[]> {
  const figures = await getFigures();
  return figures
    .filter((figure) => figure.pantheonSlug === pantheonSlug)
    .sort((a, b) => a.order - b.order);
}

export async function getFigure(slug: string): Promise<Figure | null> {
  const figures = await getFigures();
  return figures.find((figure) => figure.slug === slug) ?? null;
}
