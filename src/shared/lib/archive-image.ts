/** 자료 이미지의 출처 정보. 퍼블릭 도메인이 아니면 저작자와 라이선스를 반드시 표기합니다. */
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
 * 클라이언트 컴포넌트로 직렬화되는 데이터(RSC 페이로드)를 줄입니다.
 */
export type ThumbImage = Pick<ArchiveImage, "src" | "width" | "height">;

export const toThumb = ({ src, width, height }: ArchiveImage): ThumbImage => ({
  src,
  width,
  height,
});

/**
 * 대체 텍스트와 함께 보여 주는 자료 이미지(RevealImage). 그림마다의 출처는 화면 대신 README의 출처에
 * 모으므로 출처를 빼고 넘깁니다. 출처를 화면에 표기하는 곳(어드민에서 올린 작품 일러스트)만 ArchiveImage를 씁니다.
 */
export type ShownImage = Pick<ArchiveImage, "src" | "width" | "height" | "alt">;

export const toShown = ({ src, width, height, alt }: ArchiveImage): ShownImage => ({
  src,
  width,
  height,
  alt,
});

/** 출처 표기 문구. 예) "Marie-Lan Nguyen · CC BY 2.5" */
export function formatCredit({ artist, license }: ImageCredit) {
  const isUnknown = !artist || /^unknown/i.test(artist);
  return isUnknown ? license : `${artist} · ${license}`;
}
