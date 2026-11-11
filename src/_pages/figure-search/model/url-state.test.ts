import { describe, expect, it } from "vitest";

import { INITIAL_SEARCH, parseSearch, toSearch } from "./url-state";

describe("검색 상태와 주소", () => {
  it("주소를 읽고 다시 만들면 같습니다", () => {
    const state = parseSearch("?q=%EC%B2%9C%EB%91%A5&continent=europe&kind=monster");
    expect(state).toEqual({ query: "천둥", continent: "europe", kind: "monster" });
    expect(parseSearch(toSearch(state))).toEqual(state);
  });

  it("모르는 값은 기본값으로 둡니다", () => {
    expect(parseSearch("?continent=mars&kind=dragon")).toEqual(INITIAL_SEARCH);
  });

  it("검색과 상관없는 주소 값은 그대로 둡니다", () => {
    expect(toSearch({ ...INITIAL_SEARCH, kind: "hero" }, "?id=story&q=old")).toBe(
      "?id=story&kind=hero",
    );
  });

  it("기본값만 있으면 주소에 아무것도 붙이지 않습니다", () => {
    expect(toSearch(INITIAL_SEARCH)).toBe("");
    expect(toSearch({ ...INITIAL_SEARCH, query: "  " })).toBe("");
  });
});
