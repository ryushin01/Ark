import { genealogyRepository } from "./table";

import type { Genealogy } from "../model/types";

import "server-only";

/** 계보 저장. 없으면 만들고, 있으면 고칩니다. */
export async function saveGenealogy(genealogy: Genealogy) {
  const current = await genealogyRepository.find(genealogy.pantheonSlug);
  if (current) return genealogyRepository.update(genealogy.pantheonSlug, genealogy);
  return genealogyRepository.insert(genealogy);
}
