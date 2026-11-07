import { createMockTable } from "@/shared/api";

import { MOCK_PANTHEONS } from "./mock-data";

import "server-only";

/** 신화 계열 저장소. Supabase를 연결하면 이 파일의 구현만 바꿉니다. */
export const pantheonTable = createMockTable("pantheons", MOCK_PANTHEONS);
