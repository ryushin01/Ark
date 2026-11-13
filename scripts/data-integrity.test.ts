/**
 * 엔티티 사이의 참조 검사: 목업 데이터가 서로 가리키는 신·자료가 실제로 있는지 확인합니다.
 * 여러 엔티티의 목업을 함께 읽어야 해서 FSD 슬라이스 밖(scripts)에 둡니다.
 */
import { describe, expect, it } from "vitest";

import { MOCK_EXHIBITS } from "../src/entities/exhibit/api/mock-data";
import { MOCK_FIGURES } from "../src/entities/figure/api/mock-data";
import { MOCK_RELICS } from "../src/entities/relic/api/mock-data";

const figures = new Set(MOCK_FIGURES.map((figure) => figure.slug));
const exhibits = new Set(MOCK_EXHIBITS.map((exhibit) => exhibit.id));

describe("목업 데이터 참조", () => {
  it("유물이 Ark에 있는 신·인물과 소장 자료를 가리킨다", () => {
    for (const relic of MOCK_RELICS) {
      for (const slug of relic.figureSlugs)
        expect(figures.has(slug), `${relic.slug}: ${slug}`).toBe(true);
      if (relic.exhibitId) expect(exhibits.has(relic.exhibitId), relic.exhibitId).toBe(true);
    }
  });

  it("소장 자료가 Ark에 있는 신·인물을 가리킨다", () => {
    for (const exhibit of MOCK_EXHIBITS)
      expect(figures.has(exhibit.figureSlug), exhibit.id).toBe(true);
  });
});
