import { cacheLife, cacheTag } from "next/cache";

import { workRepository } from "./table";

import type { Work } from "../model/types";

export const WORK_TAG = "works";

/** 어드민용: 비공개(draft)를 포함한 모든 작품 */
export async function getWorks(): Promise<Work[]> {
  "use cache";
  cacheTag(WORK_TAG);
  const rows = await workRepository.list();
  // Supabase를 읽지 못해 내장 데이터로 대신했으면 몇 분만 캐시해, 다시 연결되면 곧 실제 데이터로 돌아갑니다.
  if (workRepository.servingFallback()) cacheLife("minutes");
  else cacheLife("hours");
  return rows;
}

/** 공개 화면에 보여 줄 작품만 돌려줍니다. (draft 제외) */
export async function getPublishedWorks(): Promise<Work[]> {
  const works = await getWorks();
  return works.filter((work) => work.status === "published");
}

export async function getWorksByFigure(figureSlug: string): Promise<Work[]> {
  const works = await getPublishedWorks();
  return works.filter((work) => work.figureSlugs.includes(figureSlug));
}

export async function getWork(slug: string): Promise<Work | null> {
  const works = await getWorks();
  return works.find((work) => work.slug === slug) ?? null;
}
