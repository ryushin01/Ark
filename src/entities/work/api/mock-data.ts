import type { Work } from "../model/types";

/**
 * 목업 데이터. 확인한 사실만 적고, 확인하지 못한 항목은 비워 둔 채 draft로 둡니다.
 * 작품 이미지는 넣지 않습니다. (어드민에서 출처와 함께 등록)
 */
export const MOCK_WORKS: Work[] = [
  {
    slug: "final-fantasy",
    title: "파이널 판타지",
    titleOriginal: "Final Fantasy",
    medium: "game",
    year: 1987,
    creator: "스퀘어 (현 스퀘어 에닉스)",
    summary:
      "오딘, 시바, 이프리트, 바하무트처럼 여러 신화와 전설의 이름을 소환수로 빌려 왔습니다. 힌두교의 남신 시바는 시리즈에서 얼음을 다루는 여성 소환수로 새롭게 해석되었습니다.",
    figureSlugs: ["odin", "shiva"],
    images: [],
    status: "published",
  },
  {
    slug: "fate-stay-night",
    title: "페이트/스테이 나이트",
    titleOriginal: "Fate/stay night",
    medium: "visual-novel",
    year: 2004,
    creator: "TYPE-MOON",
    summary:
      "신화와 역사 속 영웅을 ‘서번트’로 불러내 싸우게 하는 작품입니다. 메소포타미아의 영웅 왕 길가메시가 주요 인물로 등장합니다.",
    figureSlugs: ["gilgamesh"],
    images: [],
    status: "published",
  },
  {
    slug: "cyber-formula",
    title: "신세기 GPX 사이버 포뮬러",
    titleOriginal: "新世紀GPXサイバーフォーミュラ",
    medium: "anime",
    year: 1991,
    creator: "선라이즈",
    summary: null,
    figureSlugs: [],
    images: [],
    status: "draft",
  },
  {
    slug: "the-war-of-genesis",
    title: "창세기전",
    titleOriginal: "창세기전",
    medium: "game",
    year: 1995,
    creator: "소프트맥스",
    summary: null,
    figureSlugs: [],
    images: [],
    status: "draft",
  },
  {
    slug: "farland-tactics",
    title: "파랜드 택틱스",
    titleOriginal: "ファーランドタクティクス",
    medium: "game",
    year: null,
    creator: null,
    summary: null,
    figureSlugs: [],
    images: [],
    status: "draft",
  },
  {
    slug: "saekano",
    title: "시원찮은 그녀를 위한 육성방법",
    titleOriginal: "冴えない彼女の育てかた",
    medium: "novel",
    year: 2012,
    creator: "마루토 후미아키",
    summary: null,
    figureSlugs: [],
    images: [],
    status: "draft",
  },
];
