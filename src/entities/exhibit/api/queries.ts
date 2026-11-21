import { cacheLife, cacheTag } from "next/cache";

import { exhibitRepository } from "./table";

import type { Exhibit } from "../model/types";

export const EXHIBIT_TAG = "exhibits";

export async function getExhibits(): Promise<Exhibit[]> {
  "use cache";
  cacheTag(EXHIBIT_TAG);
  const rows = await exhibitRepository.list();
  // Supabase를 읽지 못해 내장 데이터로 대신했으면 몇 분만 캐시해, 다시 연결되면 곧 실제 데이터로 돌아갑니다.
  if (exhibitRepository.servingFallback()) cacheLife("minutes");
  else cacheLife("hours");
  return rows;
}

export async function getExhibitsByFigure(figureSlug: string): Promise<Exhibit[]> {
  const exhibits = await getExhibits();
  return exhibits.filter((exhibit) => exhibit.figureSlug === figureSlug);
}

export async function getExhibit(id: string): Promise<Exhibit | null> {
  const exhibits = await getExhibits();
  return exhibits.find((exhibit) => exhibit.id === id) ?? null;
}
