import { describe, expect, it } from "vitest";

import { MOCK_FIGURES } from "../api/mock-data";
import { BONDS, findBonds } from "./bonds";

describe("탈것·동반자", () => {
  it("모든 짝이 Ark에 있는 신·인물을 가리키고 겹치지 않는다", () => {
    const slugs = new Set(MOCK_FIGURES.map((figure) => figure.slug));
    for (const { rider, partner } of BONDS) {
      expect(slugs.has(rider), rider).toBe(true);
      expect(slugs.has(partner), partner).toBe(true);
    }
    const keys = BONDS.map((bond) => `${bond.rider}>${bond.partner}>${bond.relation}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("타는 쪽에서는 탈것·동반자를, 탈것·동반자 쪽에서는 타는 이·함께하는 이를 모은다", () => {
    expect(findBonds("odin")).toEqual([
      { label: "탈것", items: [{ slug: "sleipnir", note: undefined }] },
      { label: "동반자", items: [{ slug: "huginn-muninn", note: undefined }] },
    ]);
    expect(findBonds("pegasus").map((row) => row.label)).toEqual(["타는 이"]);
    expect(findBonds("pegasus")[0].items.map((item) => item.slug)).toEqual([
      "bellerophon",
      "perseus",
    ]);
    expect(findBonds("jade-rabbit")).toEqual([
      { label: "함께하는 이", items: [{ slug: "change", note: undefined }] },
    ]);
    expect(findBonds("zeus")).toEqual([]);
  });
});
