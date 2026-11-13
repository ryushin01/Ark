"use client";

import { type RefObject, useEffect } from "react";

import { useMotionOff } from "./use-motion-off";

/**
 * 요소가 화면을 지나가는 정도(0~1)를 CSS 변수로 씁니다. 리렌더링 없이 스타일만 바꿉니다.
 * - start: 요소 위쪽이 화면 위쪽에 닿을 때 0 (sticky 히어로)
 * - enter: 요소 위쪽이 화면 가운데에 닿을 때 0 (타임라인 진행선)
 * 사용자가 동작 줄이기를 켰으면 항상 1입니다.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { variable = "--progress", mode = "start" }: { variable?: string; mode?: "start" | "enter" } = {},
) {
  // 운영체제의 동작 줄이기뿐 아니라 사이트의 움직임 끄기도 따르고, 바꾸면 바로 반영합니다.
  const motionOff = useMotionOff();
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (motionOff) {
      element.style.setProperty(variable, "1");
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress =
        mode === "start"
          ? -rect.top / Math.max(1, rect.height - viewport)
          : (viewport / 2 - rect.top) / Math.max(1, rect.height);
      element.style.setProperty(variable, String(Math.min(1, Math.max(0, progress))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, variable, mode, motionOff]);
}
