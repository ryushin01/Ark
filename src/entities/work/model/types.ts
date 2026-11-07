import type { ArchiveImage } from "@/shared/lib";

export const WORK_MEDIUMS = ["game", "anime", "novel", "visual-novel"] as const;

export type WorkMedium = (typeof WORK_MEDIUMS)[number];

export const WORK_STATUS_LABEL = {
  draft: "비공개 (확인 중)",
  published: "공개",
} as const;

export const WORK_MEDIUM_LABEL: Record<WorkMedium, string> = {
  game: "게임",
  anime: "애니메이션",
  novel: "소설",
  "visual-novel": "비주얼 노벨",
};

/**
 * 신화의 영향을 받은 판타지·서브컬처 작품
 * - 작품 이미지는 저작권자가 있으므로 어드민에서 출처와 함께 직접 올립니다.
 * - 내용을 확인하지 않은 항목은 draft로 두고 공개 화면에 내보내지 않습니다.
 */
export type Work = {
  slug: string;
  title: string;
  titleOriginal: string;
  medium: WorkMedium;
  /** 첫 발표 연도 */
  year: number | null;
  creator: string | null;
  summary: string | null;
  /** 영향을 준 신·영웅 */
  figureSlugs: string[];
  images: ArchiveImage[];
  status: "draft" | "published";
};
