import { cacheLife, cacheTag } from "next/cache";

import { genealogyRepository } from "./table";

import type { Genealogy } from "../model/types";

export const GENEALOGY_TAG = "genealogies";

/** 모든 계보 */
export async function getGenealogies(): Promise<Genealogy[]> {
  "use cache";
  cacheTag(GENEALOGY_TAG);
  const rows = await genealogyRepository.list();
  // Supabase를 읽지 못해 내장 데이터로 대신했으면 몇 분만 캐시해, 다시 연결되면 곧 실제 데이터로 돌아갑니다.
  if (genealogyRepository.servingFallback()) cacheLife("minutes");
  else cacheLife("hours");
  return rows;
}

/** 계열의 계보. 없거나 비어 있으면 null */
export async function getGenealogy(pantheonSlug: string): Promise<Genealogy | null> {
  const genealogy = (await getGenealogies()).find((item) => item.pantheonSlug === pantheonSlug);
  return genealogy && genealogy.roots.length > 0 ? genealogy : null;
}
