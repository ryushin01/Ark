import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EARLY_REVEAL_SCRIPT } from "./EarlyReveal";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

/** 스크립트가 만든 관찰자를 붙잡아, 테스트가 첫 판정을 직접 보냅니다. */
let observer: { callback: Callback; targets: Element[]; disconnected: boolean };
let observed: Set<Element>;

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: Callback) {
        observer = { callback, targets: [], disconnected: false };
        observed = new Set();
      }
      observe(target: Element) {
        observer.targets.push(target);
        observed.add(target);
      }
      unobserve(target: Element) {
        observed.delete(target);
      }
      disconnect() {
        observer.disconnected = true;
        observed.clear();
      }
    },
  );
  document.body.innerHTML = `
    <p data-reveal="" id="lead">첫 문단</p>
    <p data-reveal="" id="below">아래 문단</p>
    <figure data-reveal="image" id="loaded"><img alt=""></figure>
    <figure data-reveal="image" id="loading"><img alt=""></figure>`;
  Object.defineProperty(document.querySelector("#loaded img"), "complete", { value: true });
  Object.defineProperty(document.querySelector("#loading img"), "complete", { value: false });
  new Function(EARLY_REVEAL_SCRIPT)();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

const send = (visible: string[]) =>
  observer.callback(
    observer.targets.map((target) => ({ target, isIntersecting: visible.includes(target.id) })),
  );
const revealed = (id: string) => document.getElementById(id)?.hasAttribute("data-revealed");

describe("EarlyReveal", () => {
  it("[data-reveal] 요소를 모두 관찰하고, 화면에 들어온 글은 바로 드러낸 뒤 그 요소만 관찰을 멈춘다", () => {
    expect(observer.targets).toHaveLength(4);
    send(["lead", "loaded"]);
    expect(revealed("lead")).toBe(true);
    expect(revealed("below")).toBe(false);
    expect(revealed("loaded")).toBe(true);
    expect([...observed].map((target) => target.id)).toEqual(["below", "loading"]);
    // 번들을 받기 전에 스크롤해 들어온 글도 드러냅니다.
    send(["below"]);
    expect(revealed("below")).toBe(true);
  });

  it("그림은 다 받은 뒤(또는 받지 못한 뒤) 드러낸다", () => {
    send(["loading"]);
    expect(revealed("loading")).toBe(false);
    document.querySelector("#loading img")?.dispatchEvent(new Event("load"));
    expect(revealed("loading")).toBe(true);
  });

  it("스크립트보다 늦게 도착한(스트리밍) 요소도 관찰한다", async () => {
    const late = document.createElement("p");
    late.id = "late";
    late.setAttribute("data-reveal", "");
    const wrapper = document.createElement("div");
    wrapper.append(late);
    document.body.append(wrapper);
    await Promise.resolve(); // MutationObserver 콜백은 마이크로태스크에서 돕니다.
    expect(observer.targets.map((target) => target.id)).toContain("late");
    send(["late"]);
    expect(revealed("late")).toBe(true);
  });

  it("React가 넘겨받을 수 있게 관찰자를 window에 둔다", () => {
    expect(window.__arkEarlyReveal).toBeDefined();
    window.__arkEarlyReveal?.disconnect();
    expect(observer.disconnected).toBe(true);
    delete window.__arkEarlyReveal;
  });

  it("IntersectionObserver가 없으면 아무것도 하지 않는다 (그 뒤는 React가 맡음)", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    document.body.innerHTML = '<p data-reveal="" id="x">글</p>';
    expect(() => new Function(EARLY_REVEAL_SCRIPT)()).not.toThrow();
    expect(revealed("x")).toBe(false);
  });
});
