import { createMockTable } from "@/shared/api";

import { MOCK_WORKS } from "./mock-data";

import "server-only";

/** 영향받은 작품 저장소. Supabase를 연결하면 이 파일의 구현만 바꿉니다. */
export const workTable = createMockTable("works", MOCK_WORKS);
