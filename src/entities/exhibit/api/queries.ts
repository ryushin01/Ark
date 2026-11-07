import { cacheLife, cacheTag } from "next/cache";

import { exhibitRepository } from "./table";

import type { Exhibit } from "../model/types";

export const EXHIBIT_TAG = "exhibits";

export async function getExhibits(): Promise<Exhibit[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(EXHIBIT_TAG);
  return await exhibitRepository.list();
}

export async function getExhibitsByFigure(figureSlug: string): Promise<Exhibit[]> {
  const exhibits = await getExhibits();
  return exhibits.filter((exhibit) => exhibit.figureSlug === figureSlug);
}

export async function getExhibit(id: string): Promise<Exhibit | null> {
  const exhibits = await getExhibits();
  return exhibits.find((exhibit) => exhibit.id === id) ?? null;
}
