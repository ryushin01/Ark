import { afterEach, describe, expect, it, vi } from "vitest";

import { FONT_LOADER_SCRIPT, FONT_LOADER_TIMEOUT_MS } from "./FontLoader";

const run = () => new Function(FONT_LOADER_SCRIPT)();
const fonts = () => document.documentElement.dataset.fonts;

describe("FontLoader", () => {
  afterEach(() => {
    delete document.documentElement.dataset.fonts;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("부크크 명조 두 굵기를 다 받으면 화면을 연다", async () => {
    const load = vi.fn().mockResolvedValue([]);
    Object.defineProperty(document, "fonts", { value: { load }, configurable: true });
    run();
    expect(fonts()).toBeUndefined();
    await vi.waitFor(() => expect(fonts()).toBe("ready"));
    expect(load).toHaveBeenCalledWith('400 1em "Bookk Myungjo"', "가");
    expect(load).toHaveBeenCalledWith('700 1em "Bookk Myungjo"', "가");
  });

  it("글꼴이 늦으면 제한 시간 뒤에 연다", () => {
    vi.useFakeTimers();
    Object.defineProperty(document, "fonts", {
      value: { load: () => new Promise(() => {}) },
      configurable: true,
    });
    run();
    vi.advanceTimersByTime(FONT_LOADER_TIMEOUT_MS - 1);
    expect(fonts()).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(fonts()).toBe("ready");
  });
});
