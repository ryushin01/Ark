import { describe, expect, it } from "vitest";

import { unlistedCredit } from "./credits";
import { MOCK_EXHIBITS } from "./mock-data";

const seed = MOCK_EXHIBITS[0]!;

describe("unlistedCredit", () => {
  it("출처 전체 목록에 있는 자료(시드 그대로)는 화면에 출처를 보여 주지 않는다", () => {
    expect(unlistedCredit(seed)).toBeNull();
    // 빈 글자와 null, 앞뒤 공백 차이는 같은 출처로 봅니다.
    const credit = { ...seed.image.credit, licenseUrl: seed.image.credit.licenseUrl ?? "" };
    expect(unlistedCredit({ ...seed, image: { ...seed.image, credit } })).toBeNull();
  });

  it("어드민에서 더한 자료는 출처를 화면에 보여 준다", () => {
    const added = { ...seed, id: "added-by-admin" };
    expect(unlistedCredit(added)).toEqual(seed.image.credit);
  });

  it("목록에 있던 자료라도 이미지나 출처를 고쳤으면 화면에 보여 준다", () => {
    const credit = { ...seed.image.credit, license: "CC BY 4.0" };
    expect(unlistedCredit({ ...seed, image: { ...seed.image, credit } })).toEqual(credit);
    expect(unlistedCredit({ ...seed, image: { ...seed.image, src: "/uploads/new.jpg" } })).toEqual(
      seed.image.credit,
    );
  });
});
