import { relicRepository } from "./table";

import type { RelicInput } from "../model/schema";
import type { Relic } from "../model/types";

import "server-only";

export async function createRelic(input: RelicInput): Promise<Relic | "duplicate"> {
  return relicRepository.insert(input);
}

/** 주소 이름(slug)은 그대로 두고 나머지를 고칩니다. */
export async function updateRelic(slug: string, input: RelicInput): Promise<Relic | null> {
  const current = await relicRepository.find(slug);
  if (!current) return null;
  return relicRepository.update(slug, { ...current, ...input, slug });
}

export async function deleteRelic(slug: string) {
  return relicRepository.remove(slug);
}
