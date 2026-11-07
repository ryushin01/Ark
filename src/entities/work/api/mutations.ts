import { workTable } from "./table";

import type { WorkInput } from "../model/schema";
import type { Work } from "../model/types";

import "server-only";

export async function createWork(input: WorkInput): Promise<Work | "duplicate"> {
  if (workTable.find((row) => row.slug === input.slug)) return "duplicate";
  return workTable.insert({ ...input, images: [] });
}

/** 주소 이름(slug)과 이미지는 그대로 두고 나머지를 고칩니다. */
export async function updateWork(slug: string, input: WorkInput): Promise<Work | null> {
  const current = workTable.find((row) => row.slug === slug);
  if (!current) return null;
  return workTable.update((row) => row.slug === slug, { ...current, ...input, slug }) ?? null;
}

export async function deleteWork(slug: string) {
  return workTable.remove((row) => row.slug === slug);
}
