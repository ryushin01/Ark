import { describe, expect, it } from "vitest";

import { skipsOptimization } from "./original-images";

describe("skipsOptimization", () => {
  it("최적화 한도 뒤에 더한 자료 그림만 원본을 그대로 보냅니다", () => {
    expect(skipsOptimization("/images/exhibits/munmu-silla-dragon-head.jpg")).toBe(true);
    expect(skipsOptimization("/images/exhibits/thor-jotnar.jpg")).toBe(false);
  });

  it("어드민에서 올린 외부 주소는 그대로 최적화합니다", () => {
    expect(
      skipsOptimization(
        "https://x.supabase.co/storage/v1/object/public/exhibits/munmu-silla-dragon-head.jpg",
      ),
    ).toBe(false);
  });
});
