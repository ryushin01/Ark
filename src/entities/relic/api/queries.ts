import { cacheLife, cacheTag } from "next/cache";

import { relicRepository } from "./table";

import type { Relic } from "../model/types";

export const RELIC_TAG = "relics";

/** 모든 유물. 전시 순서대로 */
export async function getRelics(): Promise<Relic[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(RELIC_TAG);
  const relics = await relicRepository.list();
  return relics.sort((a, b) => a.order - b.order);
}

export async function getRelic(slug: string): Promise<Relic | null> {
  return (await getRelics()).find((relic) => relic.slug === slug) ?? null;
}
