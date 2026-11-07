import { workRepository } from "./table";

import type { WorkInput } from "../model/schema";
import type { Work } from "../model/types";
import type { ArchiveImage } from "@/shared/lib";

import "server-only";

export async function createWork(input: WorkInput): Promise<Work | "duplicate"> {
  return workRepository.insert({ ...input, images: [] });
}

/** 주소 이름(slug)과 이미지는 그대로 두고 나머지를 고칩니다. */
export async function updateWork(slug: string, input: WorkInput): Promise<Work | null> {
  const current = await workRepository.find(slug);
  if (!current) return null;
  return workRepository.update(slug, { ...current, ...input, slug });
}

/** 작품 이미지 목록을 바꿉니다. (추가·삭제) */
export async function setWorkImages(slug: string, images: ArchiveImage[]): Promise<Work | null> {
  const current = await workRepository.find(slug);
  if (!current) return null;
  return workRepository.update(slug, { ...current, images });
}

export async function deleteWork(slug: string) {
  return workRepository.remove(slug);
}
