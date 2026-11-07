import { cacheLife, cacheTag } from "next/cache";

import { MOCK_FIGURES } from "./mock-data";

import type { Figure } from "../model/types";

export const FIGURE_TAG = "figures";

export async function getFigures(): Promise<Figure[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(FIGURE_TAG);
  return [...MOCK_FIGURES];
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
