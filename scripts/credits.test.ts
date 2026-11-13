import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { renderCredits } from "./credits";

// jsdom 환경이라 import.meta.url이 file:이 아니어서, 저장소 루트(vitest 실행 위치) 기준으로 읽습니다.
describe("자료 이미지 출처 목록", () => {
  it("docs/credits.md가 소장 자료 데이터와 같다 (어긋나면 pnpm credits)", () => {
    const file = readFileSync(resolve(process.cwd(), "docs/credits.md"), "utf8");
    expect(file).toBe(renderCredits());
  });
});
