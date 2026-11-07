import { pantheonRepository } from "./table";

import type { PantheonInput } from "../model/schema";

import "server-only";

export async function updatePantheon(slug: string, input: PantheonInput) {
  const current = await pantheonRepository.find(slug);
  if (!current) return null;
  return pantheonRepository.update(slug, { ...current, ...input });
}
