import { createMockTable } from "@/shared/api";

import { MOCK_FIGURES } from "./mock-data";

import "server-only";

/** 신·인물 저장소. Supabase를 연결하면 이 파일의 구현만 바꿉니다. */
export const figureTable = createMockTable("figures", MOCK_FIGURES);
