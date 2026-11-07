import { pantheonTable } from "./table";

import type { PantheonInput } from "../model/schema";

import "server-only";

export async function updatePantheon(slug: string, input: PantheonInput) {
  const current = pantheonTable.find((row) => row.slug === slug);
  if (!current) return null;
  return pantheonTable.update((row) => row.slug === slug, { ...current, ...input });
}
