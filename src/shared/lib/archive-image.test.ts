import { describe, expect, it } from "vitest";

import { formatCredit } from "./archive-image";

const base = { licenseUrl: null, sourceUrl: "https://commons.wikimedia.org/wiki/File:A.jpg" };

describe("formatCredit", () => {
  it("저작자와 라이선스를 함께 표기합니다", () => {
    expect(formatCredit({ ...base, artist: "Marie-Lan Nguyen", license: "CC BY 2.5" })).toBe(
      "Marie-Lan Nguyen · CC BY 2.5",
    );
  });

  it("저작자를 모르면 라이선스만 표기합니다", () => {
    expect(formatCredit({ ...base, artist: "Unknown artist", license: "Public domain" })).toBe(
      "Public domain",
    );
    expect(formatCredit({ ...base, artist: null, license: "CC0" })).toBe("CC0");
  });
});
