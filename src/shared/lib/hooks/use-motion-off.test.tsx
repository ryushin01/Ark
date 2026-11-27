import { renderToString } from "react-dom/server";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isMotionOff, useMotionOff } from "./use-motion-off";

/** 운영체제의 '동작 줄이기' 설정을 흉내 내는 matchMedia. jsdom에는 없습니다. */
function fakeReducedMotion(initial: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: initial,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  };
  vi.stubGlobal("matchMedia", (query: string) => {
    expect(query).toBe("(prefers-reduced-motion: reduce)");
    return media;
  });
  return {
    listeners,
    set(matches: boolean) {
      media.matches = matches;
      for (const listener of listeners) listener();
    },
  };
}

function MotionStatus() {
  return <p role="status">{useMotionOff() ? "움직임 꺼짐" : "움직임 켜짐"}</p>;
}

beforeEach(() => {
  delete document.documentElement.dataset.motion;
});

afterEach(() => {
  // 가짜 matchMedia를 거두기 전에 화면을 먼저 내립니다(늦게 온 설정 변화로 다시 그리지 않게).
  cleanup();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.motion;
});

describe("useMotionOff", () => {
  it("운영체제에서 동작 줄이기를 켜고 끄면 바로 따라갑니다", () => {
    const system = fakeReducedMotion(false);
    render(<MotionStatus />);
    expect(screen.getByRole("status")).toHaveTextContent("움직임 켜짐");

    act(() => system.set(true));
    expect(screen.getByRole("status")).toHaveTextContent("움직임 꺼짐");

    act(() => system.set(false));
    expect(screen.getByRole("status")).toHaveTextContent("움직임 켜짐");
  });

  it("사이트의 움직임 설정(html data-motion)을 끄면 따라갑니다", async () => {
    fakeReducedMotion(false);
    render(<MotionStatus />);
    expect(screen.getByRole("status")).toHaveTextContent("움직임 켜짐");

    document.documentElement.dataset.motion = "off";
    expect(await screen.findByText("움직임 꺼짐")).toBeInTheDocument();

    document.documentElement.dataset.motion = "on";
    expect(await screen.findByText("움직임 켜짐")).toBeInTheDocument();
  });

  it("화면을 떠나면 설정 변화를 더 듣지 않습니다", () => {
    const system = fakeReducedMotion(false);
    const { unmount } = render(<MotionStatus />);
    expect(system.listeners.size).toBe(1);
    unmount();
    expect(system.listeners.size).toBe(0);
  });

  it("서버에서 그릴 때는 움직임이 켜진 것으로 봅니다", () => {
    fakeReducedMotion(true);
    expect(renderToString(<MotionStatus />)).toContain("움직임 켜짐");
  });
});

describe("isMotionOff", () => {
  it("운영체제 설정이나 사이트 설정 중 하나라도 꺼져 있으면 true입니다", () => {
    const system = fakeReducedMotion(false);
    expect(isMotionOff()).toBe(false);
    system.set(true);
    expect(isMotionOff()).toBe(true);
    system.set(false);
    document.documentElement.dataset.motion = "off";
    expect(isMotionOff()).toBe(true);
  });
});
