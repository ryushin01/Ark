import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { MOCK_EXHIBITS } from "../src/entities/exhibit/api/mock-data";
import { CREDITS_PATH, renderCredits } from "./credits";

// 테스트 환경(jsdom)에서는 import.meta.url이 파일 주소가 아니라서 프로젝트 루트(vitest 실행 위치)를 기준으로 읽습니다.
const read = () => readFileSync(join(process.cwd(), CREDITS_PATH), "utf8");

describe("자료 그림 출처 전체 목록", () => {
  it("자료 데이터에서 만든 내용과 같다 (데이터를 바꿨으면 pnpm credits)", () => {
    expect(read()).toBe(renderCredits());
  });

  it("자료 그림마다 원본 주소가 한 줄씩 있다", () => {
    const content = read();
    for (const { image } of MOCK_EXHIBITS) {
      expect(content).toContain(`[Commons](${image.credit.sourceUrl})`);
    }
  });
});
