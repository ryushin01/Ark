import { describe, expect, it } from "vitest";

import { exhibitInputSchema } from "./schema";

const valid = {
  figureSlug: "zeus",
  title: "오트리콜리의 제우스",
  kind: "sculpture",
  dateLabel: "",
  holder: " 바티칸 박물관 ",
  note: "",
  alt: "수염 난 제우스의 대리석 흉상",
  artist: "",
  license: "Public domain",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Zeus_Otricoli.jpg",
  licenseUrl: "",
};

describe("exhibitInputSchema", () => {
  it("빈 칸은 null로, 나머지는 앞뒤 공백을 지웁니다", () => {
    const result = exhibitInputSchema.parse(valid);
    expect(result.dateLabel).toBeNull();
    expect(result.holder).toBe("바티칸 박물관");
    expect(result.artist).toBeNull();
    expect(result.licenseUrl).toBeNull();
  });

  it("대체 텍스트는 5자 이상이어야 합니다 (KWCAG 5.1.1)", () => {
    const result = exhibitInputSchema.safeParse({ ...valid, alt: "제우스" });
    expect(result.error?.issues[0]?.path).toEqual(["alt"]);
  });

  it("원본·라이선스 주소는 주소 형식이어야 하고, 라이선스 주소는 비워 둘 수 있습니다", () => {
    expect(exhibitInputSchema.safeParse({ ...valid, sourceUrl: "위키미디어" }).success).toBe(false);
    expect(exhibitInputSchema.safeParse({ ...valid, licenseUrl: "cc by" }).success).toBe(false);
    const withLicense = exhibitInputSchema.parse({
      ...valid,
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    });
    expect(withLicense.licenseUrl).toBe("https://creativecommons.org/licenses/by/4.0/");
  });
});
