import { describe, expect, it } from "vitest";

import { formatCredit, toThumb } from "./archive-image";

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

describe("toThumb", () => {
  it("그림을 그리는 데 필요한 주소와 크기만 남깁니다", () => {
    const image = {
      src: "/images/exhibits/zeus.jpg",
      width: 1200,
      height: 1600,
      alt: "제우스 흉상",
      credit: { ...base, artist: null, license: "Public domain" },
    };
    expect(toThumb(image)).toEqual({ src: "/images/exhibits/zeus.jpg", width: 1200, height: 1600 });
  });
});
