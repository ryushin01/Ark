import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_KEY } from "./scroll-memory";
import { ScrollRestoration } from "./ScrollRestoration";

vi.mock("next/navigation", () => ({ usePathname: () => window.location.pathname }));
vi.mock("@ssgoi/react", () => ({ useSsgoiTransition: () => ({ status: "idle" }) }));

/** 이 문서를 처음 불러온 주소와 이동 종류(navigation 항목)를 흉내 냅니다. */
function stubNavigation(url: string, type: NavigationTimingType = "navigate") {
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([
    { name: new URL(url, window.location.origin).href, type } as PerformanceNavigationTiming,
  ]);
}

let scrollY = 0;
const memory = () =>
  JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, number>;

beforeEach(() => {
  sessionStorage.clear();
  scrollY = 0;
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
  vi.spyOn(window, "scrollTo").mockImplementation(((options: ScrollToOptions) => {
    scrollY = options.top ?? 0;
  }) as typeof window.scrollTo);
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("ScrollRestoration", () => {
  it("넘겨받기 전에 스크롤한 자리를 넘겨받는 순간 기록한다", () => {
    window.history.replaceState(null, "", "/figures");
    stubNavigation("/figures");
    scrollY = 4254; // React가 붙기 전에 사용자가 내려간 자리
    render(<ScrollRestoration />);
    expect(memory()["/figures"]).toBe(4254);
  });

  it("넘겨받기 전에 뒤로 갔으면(문서를 연 주소와 다름) 저장된 자리로 되돌리고, 그 자리를 덮어쓰지 않는다", () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ "/figures": 4254 }));
    // 새로고침한 신 화면 문서에서, 넘겨받기 전에 목록(/figures)으로 뒤로 간 상태
    stubNavigation("/figures/odin", "reload");
    window.history.replaceState({ __NA: true }, "", "/figures");
    scrollY = 2643; // 브라우저가 짧은 이전 화면 높이에 걸려 잘라 되살린 자리
    render(<ScrollRestoration />);
    expect(memory()["/figures"]).toBe(4254);
    vi.advanceTimersToNextFrame();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 4254, left: 0, behavior: "instant" });
  });

  it("같은 문서에서 #만 바뀐 이동(Next 기록 항목이 아님)은 되돌리지 않는다", () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ "/figures": 4254 }));
    stubNavigation("/figures/odin");
    window.history.replaceState(null, "", "/figures");
    render(<ScrollRestoration />);
    vi.advanceTimersToNextFrame();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
