import type { ArchiveImage } from "@/shared/lib";

export type ExhibitKind =
  "sculpture" | "painting" | "print" | "relief" | "manuscript" | "photograph";

export const EXHIBIT_KIND_LABEL: Record<ExhibitKind, string> = {
  sculpture: "조각",
  painting: "회화",
  print: "판화·삽화",
  relief: "부조",
  manuscript: "필사본",
  photograph: "사진",
};

/** 도서관이 보여 주는 자료 한 점 (조각상, 회화, 유물 등) */
export type Exhibit = {
  id: string;
  figureSlug: string;
  title: string;
  kind: ExhibitKind;
  /** 제작 시기 표기 */
  dateLabel: string | null;
  /** 소장처 */
  holder: string | null;
  /** 해석이 갈리는 자료라면 그 설명 */
  note: string | null;
  image: ArchiveImage;
};
