import { createMockTable } from "@/shared/api";

import { MOCK_EXHIBITS } from "./mock-data";

import "server-only";

/** 소장 자료 저장소. Supabase를 연결하면 이 파일의 구현만 바꿉니다. */
export const exhibitTable = createMockTable("exhibits", MOCK_EXHIBITS);
