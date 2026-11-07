import { VisuallyHidden } from "../visually-hidden";

import type { ImageCredit } from "@/shared/lib";

/**
 * 이미지 출처 표기: 저작자 · 라이선스(전문 링크) · 원본 링크
 * CC 라이선스의 권장 표기(저작자, 출처, 라이선스)를 따릅니다. 저작자를 모르면 빼고, 라이선스 주소가 없으면 글자만 씁니다.
 */
export function CreditLine({
  credit,
  linkClassName,
}: {
  credit: ImageCredit;
  linkClassName?: string;
}) {
  const hasArtist = Boolean(credit.artist) && !/^unknown/i.test(credit.artist ?? "");
  return (
    <>
      {hasArtist && <>{credit.artist} · </>}
      {credit.licenseUrl ? (
        <a href={credit.licenseUrl} className={linkClassName}>
          {credit.license} <VisuallyHidden>라이선스 전문</VisuallyHidden>
        </a>
      ) : (
        credit.license
      )}
      {" · "}
      <a href={credit.sourceUrl} className={linkClassName}>
        원본 <VisuallyHidden>출처</VisuallyHidden>
      </a>
    </>
  );
}
