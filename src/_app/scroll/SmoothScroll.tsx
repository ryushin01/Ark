"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

import { useMotionOff } from "@/shared/lib";

/**
 * Lenis 부드러운 스크롤
 * - 동작 줄이기를 켰거나 사이트의 움직임 설정을 껐으면 쓰지 않습니다.
 * - 페이지를 옮기면 맨 위로 바로 이동합니다.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const motionOff = useMotionOff();

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
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
