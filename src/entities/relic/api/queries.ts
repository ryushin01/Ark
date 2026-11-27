import { cacheLife, cacheTag } from "next/cache";
import sortBy from "lodash-es/sortBy";

import { relicRepository } from "./table";

import type { Relic } from "../model/types";

export const RELIC_TAG = "relics";

/** 모든 유물. 전시 순서대로 */
export async function getRelics(): Promise<Relic[]> {
  "use cache";
  cacheTag(RELIC_TAG);
  const relics = await relicRepository.list();
  // Supabase를 읽지 못해 내장 데이터로 대신했으면 몇 분만 캐시해, 다시 연결되면 곧 실제 데이터로 돌아갑니다.
  if (relicRepository.servingFallback()) cacheLife("minutes");
  else cacheLife("hours");
  return sortBy(relics, "order");
}

export async function getRelic(slug: string): Promise<Relic | null> {
  return (await getRelics()).find((relic) => relic.slug === slug) ?? null;
}
