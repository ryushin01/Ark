import { cacheLife, cacheTag } from "next/cache";

import { pantheonRepository } from "./table";

import type { Pantheon } from "../model/types";

export const PANTHEON_TAG = "pantheons";

/** 모든 신화 계열을 가장 이른 문헌의 시기 순으로 돌려줍니다. */
export async function getPantheons(): Promise<Pantheon[]> {
  "use cache";
  cacheTag(PANTHEON_TAG);
  const rows = await pantheonRepository.list();
  // Supabase를 읽지 못해 내장 데이터로 대신했으면 몇 분만 캐시해, 다시 연결되면 곧 실제 데이터로 돌아갑니다.
  if (pantheonRepository.servingFallback()) cacheLife("minutes");
  else cacheLife("hours");
  return rows.sort((a, b) => a.eraYear - b.eraYear);
}

export async function getPantheon(slug: string): Promise<Pantheon | null> {
  const pantheons = await getPantheons();
  return pantheons.find((pantheon) => pantheon.slug === slug) ?? null;
}
