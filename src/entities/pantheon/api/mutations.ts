import { pantheonRepository } from "./table";

import type { NewPantheonInput, PantheonInput } from "../model/schema";
import type { Pantheon } from "../model/types";

import "server-only";

export async function updatePantheon(slug: string, input: PantheonInput) {
  const current = await pantheonRepository.find(slug);
  if (!current) return null;
  return pantheonRepository.update(slug, { ...current, ...input });
}

export async function createPantheon(input: NewPantheonInput): Promise<Pantheon | "duplicate"> {
  return pantheonRepository.insert(input);
}

export async function deletePantheon(slug: string) {
  return pantheonRepository.remove(slug);
}
