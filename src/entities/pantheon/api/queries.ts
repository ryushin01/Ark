import { cacheLife, cacheTag } from "next/cache";

import { pantheonRepository } from "./table";

import type { Pantheon } from "../model/types";

export const PANTHEON_TAG = "pantheons";

/** 모든 신화 계열을 가장 이른 문헌의 시기 순으로 돌려줍니다. */
export async function getPantheons(): Promise<Pantheon[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(PANTHEON_TAG);
  return (await pantheonRepository.list()).sort((a, b) => a.eraYear - b.eraYear);
}

export async function getPantheon(slug: string): Promise<Pantheon | null> {
  const pantheons = await getPantheons();
  return pantheons.find((pantheon) => pantheon.slug === slug) ?? null;
}
