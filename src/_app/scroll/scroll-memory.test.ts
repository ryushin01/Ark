import { beforeEach, describe, expect, it } from "vitest";

import {
  isBackForwardLoad,
  loadScroll,
  MAX_ENTRIES,
  saveScroll,
  scrollKey,
  STORAGE_KEY,
} from "./scroll-memory";

describe("스크롤 위치 기억", () => {
  beforeEach(() => sessionStorage.clear());

  it("경로와 검색어로 구분하고 해시는 뺀다", () => {
    expect(scrollKey({ pathname: "/figures", search: "?q=바다" })).toBe("/figures?q=바다");
  });

  it("저장한 위치를 정수로 돌려주고, 없으면 undefined", () => {
    saveScroll(sessionStorage, "/figures", 1234.6);
    expect(loadScroll(sessionStorage, "/figures")).toBe(1235);
    expect(loadScroll(sessionStorage, "/")).toBeUndefined();
  });

  it("오래된 것부터 지워 최대 개수만 남긴다", () => {
    for (let i = 0; i <= MAX_ENTRIES; i++) saveScroll(sessionStorage, `/p/${i}`, i);
    expect(loadScroll(sessionStorage, "/p/0")).toBeUndefined();
    expect(loadScroll(sessionStorage, `/p/${MAX_ENTRIES}`)).toBe(MAX_ENTRIES);
    // 다시 저장하면 최근 항목이 되어 지워지지 않는다
    saveScroll(sessionStorage, "/p/1", 7);
    saveScroll(sessionStorage, "/p/new", 1);
    expect(loadScroll(sessionStorage, "/p/1")).toBe(7);
    expect(loadScroll(sessionStorage, "/p/2")).toBeUndefined();
  });

  it("깨진 값이나 저장소가 없어도 오류 없이 넘어간다", () => {
    sessionStorage.setItem(STORAGE_KEY, "{");
    expect(loadScroll(sessionStorage, "/")).toBeUndefined();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ "/": -5, "/a": "x" }));
    expect(loadScroll(sessionStorage, "/")).toBeUndefined();
    expect(loadScroll(sessionStorage, "/a")).toBeUndefined();
    expect(() => saveScroll(undefined, "/", 1)).not.toThrow();
    expect(loadScroll(undefined, "/")).toBeUndefined();
  });

  it("뒤로·앞으로 가기로 불러온 문서인지 안다", () => {
    const perf = (type: string) =>
      ({ getEntriesByType: () => [{ type }] }) as unknown as Performance;
    expect(isBackForwardLoad(perf("back_forward"))).toBe(true);
    expect(isBackForwardLoad(perf("reload"))).toBe(false);
    expect(isBackForwardLoad(undefined)).toBe(false);
  });
});
