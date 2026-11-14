import { MOCK_EXHIBITS } from "./mock-data";

import type { Exhibit } from "../model/types";
import type { ImageCredit } from "@/shared/lib";

/** README의 출처 전체 목록(docs/credits.md)은 저장소의 자료 데이터(시드와 같은 MOCK_EXHIBITS)에서 만듭니다. */
const LISTED = new Map(MOCK_EXHIBITS.map((exhibit) => [exhibit.id, exhibit.image]));

const same = (a: string | null, b: string | null) => (a?.trim() || null) === (b?.trim() || null);

/**
 * 출처 전체 목록에 없는 자료면 그 출처를, 목록에 있으면 null을 돌려줍니다.
 * 어드민에서 더했거나 이미지·출처를 고친 자료는 데이터베이스에만 있어 목록에 들어가지 않으므로,
 * 그런 자료만 화면에 출처를 함께 보여 줍니다.
 */
export function unlistedCredit({ id, image }: Pick<Exhibit, "id" | "image">): ImageCredit | null {
  const listed = LISTED.get(id);
  const { credit } = image;
  const isListed =
    listed !== undefined &&
    listed.src === image.src &&
    same(listed.credit.artist, credit.artist) &&
    same(listed.credit.license, credit.license) &&
    same(listed.credit.licenseUrl, credit.licenseUrl) &&
    same(listed.credit.sourceUrl, credit.sourceUrl);
  return isListed ? null : credit;
}
