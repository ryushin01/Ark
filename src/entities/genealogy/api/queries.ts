import { cacheLife, cacheTag } from "next/cache";

import { genealogyRepository } from "./table";

import type { Genealogy } from "../model/types";

export const GENEALOGY_TAG = "genealogies";

/** 모든 계보 */
export async function getGenealogies(): Promise<Genealogy[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(GENEALOGY_TAG);
  return genealogyRepository.list();
}

/** 계열의 계보. 없거나 비어 있으면 null */
export async function getGenealogy(pantheonSlug: string): Promise<Genealogy | null> {
  const genealogy = (await getGenealogies()).find((item) => item.pantheonSlug === pantheonSlug);
  return genealogy && genealogy.roots.length > 0 ? genealogy : null;
}
