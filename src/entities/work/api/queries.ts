import { cacheLife, cacheTag } from "next/cache";

import { MOCK_WORKS } from "./mock-data";

import type { Work } from "../model/types";

export const WORK_TAG = "works";

/** 공개 화면에 보여 줄 작품만 돌려줍니다. (draft 제외) */
export async function getPublishedWorks(): Promise<Work[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(WORK_TAG);
  return MOCK_WORKS.filter((work) => work.status === "published");
}

export async function getWorksByFigure(figureSlug: string): Promise<Work[]> {
  const works = await getPublishedWorks();
  return works.filter((work) => work.figureSlugs.includes(figureSlug));
}
