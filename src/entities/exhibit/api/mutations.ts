import { exhibitTable } from "./table";

import type { ExhibitInput } from "../model/schema";
import type { Exhibit } from "../model/types";

import "server-only";

/** 자료의 설명과 출처를 고칩니다. 이미지 주소와 크기는 그대로 둡니다. */
export async function updateExhibit(id: string, input: ExhibitInput): Promise<Exhibit | null> {
  const current = exhibitTable.find((row) => row.id === id);
  if (!current) return null;
  const { alt, artist, license, sourceUrl, ...rest } = input;
  return (
    exhibitTable.update((row) => row.id === id, {
      ...current,
      ...rest,
      image: {
        ...current.image,
        alt,
        credit: { ...current.image.credit, artist, license, sourceUrl },
      },
    }) ?? null
  );
}

export async function deleteExhibit(id: string) {
  return exhibitTable.remove((row) => row.id === id);
}
