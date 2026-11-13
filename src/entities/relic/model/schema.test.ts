import { describe, expect, it } from "vitest";

import { NO_IMAGE, relicInputSchema } from "./schema";

const valid = {
  slug: "mjolnir",
  name: "묠니르",
  nameEn: "Mjölnir",
  kind: "weapon",
  figureSlugs: ["thor"],
  origin: "드베르그가 만든 망치",
  power: "던지면 돌아온다",
  price: "",
  source: "스노리 에다",
  exhibitId: NO_IMAGE,
  order: "1",
};

describe("유물 입력값", () => {
  it("빈 대가와 '그림 없음'은 null, 순서는 숫자로 바꾼다", () => {
    const parsed = relicInputSchema.parse(valid);
    expect(parsed.price).toBeNull();
    expect(parsed.exhibitId).toBeNull();
    expect(parsed.order).toBe(1);
  });

  it("지닌 이가 없거나 갈래가 잘못되면 거부한다", () => {
    const result = relicInputSchema.safeParse({ ...valid, figureSlugs: [], kind: "spaceship" });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["figureSlugs", "kind"]));
  });
});
