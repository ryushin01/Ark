/** 자료 이미지의 출처 정보. 화면에는 적지 않고 README의 출처와 docs/credits.md(pnpm credits)에 밝힙니다. */
export type ImageCredit = {
  artist: string | null;
  license: string;
  licenseUrl: string | null;
  sourceUrl: string;
};

/** 화면에 보여 줄 이미지 한 장 */
export type ArchiveImage = {
  src: string;
  width: number;
  height: number;
  /** 이미지가 무엇을 보여 주는지 설명하는 대체 텍스트 */
  alt: string;
  credit: ImageCredit;
};

/**
 * 그림만 그리는 곳(콜라주, 목록 썸네일)에 넘기는 최소 정보. 출처와 대체 텍스트를 빼서
 * 클라이언트 컴포넌트로 직렬화되는 데이터(RSC 페이로드)를 줄입니다. 출처를 표시하는 곳은 ArchiveImage를 씁니다.
 */
export type ThumbImage = Pick<ArchiveImage, "src" | "width" | "height">;

export const toThumb = ({ src, width, height }: ArchiveImage): ThumbImage => ({
  src,
  width,
  height,
});

/** 출처 표기 문구. 예) "Marie-Lan Nguyen · CC BY 2.5" */
export function formatCredit({ artist, license }: ImageCredit) {
  const isUnknown = !artist || /^unknown/i.test(artist);
  return isUnknown ? license : `${artist} · ${license}`;
}
