import { describe, expect, it } from "vitest";

import { firstParam } from "./search-params";

describe("firstParam (주소의 검색 조건 값 하나)", () => {
  it("값이 하나면 그대로, 여러 개면 첫 값을 씁니다", () => {
    expect(firstParam("greek")).toBe("greek");
    expect(firstParam(["norse", "greek"])).toBe("norse");
  });

  it("값이 없으면 undefined입니다", () => {
    expect(firstParam(undefined)).toBeUndefined();
    expect(firstParam([])).toBeUndefined();
  });
});
