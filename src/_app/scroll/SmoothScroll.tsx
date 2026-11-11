"use client";

import { useEffect, useRef } from "react";
import { useSsgoiTransition } from "@ssgoi/react";
import Lenis from "lenis";

import { useMotionOff } from "@/shared/lib";

/**
 * Lenis 부드러운 스크롤
 * - 동작 줄이기를 켰거나 사이트의 움직임 설정을 껐으면 쓰지 않습니다.
 * - 페이지를 옮길 때의 스크롤(새 화면은 맨 위, 뒤로 가면 보던 자리)은 화면 전환(SSGOI)이 맡습니다.
 *   전환하는 동안에는 Lenis를 멈춰, 짧은 새 화면 아래의 빈 공간이 스크롤로 드러나지 않게 합니다.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const motionOff = useMotionOff();
  const { status } = useSsgoiTransition();

  useEffect(() => {
    if (motionOff) return;
    const lenis = new Lenis({ anchors: true });
    lenisRef.current = lenis;
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [motionOff]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis || status !== "transitioning") return;
    lenis.stop();
    return () => lenis.start();
  }, [status]);

  return null;
}
