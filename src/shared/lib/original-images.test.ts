import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { skipsOptimization, smallSrc } from "./original-images";

describe("skipsOptimization", () => {
  it("저장소에 있는 모든 전시 그림은 변환 없이 원본을 그대로 보냅니다", () => {
    expect(skipsOptimization("/images/exhibits/munmu-silla-dragon-head.jpg")).toBe(true);
    expect(skipsOptimization("/images/exhibits/athena-aegis.jpg")).toBe(true);
    expect(skipsOptimization("/images/exhibits/thor-jotnar.jpg")).toBe(true);
  });

  // 최적화 요청이 한도(402)로 막혀도 그림이 나오도록 public/images/exhibits의 모든 jpg가 목록에 있고 작은 그림도 있어야 합니다.
  it("public/images/exhibits의 모든 그림이 목록과 작은 그림을 갖습니다", () => {
    const dir = join(process.cwd(), "public/images/exhibits");
    const missing = readdirSync(dir)
      .filter((file) => file.endsWith(".jpg"))
      .filter((file) => {
        const src = `/images/exhibits/${file}`;
        return !skipsOptimization(src) || !existsSync(join(process.cwd(), "public", smallSrc(src)));
      });
    expect(missing).toEqual([]);
  });

  it("어드민에서 올린 외부 주소는 그대로 최적화합니다", () => {
    expect(
      skipsOptimization(
        "https://x.supabase.co/storage/v1/object/public/exhibits/munmu-silla-dragon-head.jpg",
      ),
    ).toBe(false);
  });
});

describe("smallSrc", () => {
  it("원본을 그대로 보내는 그림은 미리 줄여 둔 작은 그림 주소를 줍니다", () => {
    expect(smallSrc("/images/exhibits/athena-aegis.jpg")).toBe(
      "/images/exhibits-thumb/athena-aegis.jpg",
    );
  });

  it("저장소 밖 주소는 그대로 둡니다", () => {
    expect(smallSrc("https://x.supabase.co/storage/v1/object/public/exhibits/a.jpg")).toBe(
      "https://x.supabase.co/storage/v1/object/public/exhibits/a.jpg",
    );
  });
});
