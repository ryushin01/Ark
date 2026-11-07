import { exhibitRepository } from "./table";

import type { ExhibitInput } from "../model/schema";
import type { Exhibit } from "../model/types";
import type { ArchiveImage } from "@/shared/lib";

import "server-only";

type ExhibitFields = Omit<ExhibitInput, "alt" | "artist" | "license" | "sourceUrl">;

/** 입력값과 이미지 파일 정보로 자료를 만듭니다. */
export async function createExhibit(
  id: string,
  input: ExhibitInput,
  file: Pick<ArchiveImage, "src" | "width" | "height">,
): Promise<Exhibit | "duplicate"> {
  const { alt, artist, license, sourceUrl, ...fields } = input;
  return exhibitRepository.insert({
    id,
    ...(fields as ExhibitFields),
    image: { ...file, alt, credit: { artist, license, licenseUrl: null, sourceUrl } },
  });
}

/** 자료의 설명과 출처를 고칩니다. 새 이미지 파일이 있으면 바꿉니다. */
export async function updateExhibit(
  id: string,
  input: ExhibitInput,
  file?: Pick<ArchiveImage, "src" | "width" | "height">,
): Promise<Exhibit | null> {
  const current = await exhibitRepository.find(id);
  if (!current) return null;
  const { alt, artist, license, sourceUrl, ...rest } = input;
  return exhibitRepository.update(id, {
    ...current,
    ...rest,
    image: {
      ...current.image,
      ...file,
      alt,
      credit: { ...current.image.credit, artist, license, sourceUrl },
    },
  });
}

export async function deleteExhibit(id: string) {
  return exhibitRepository.remove(id);
}
