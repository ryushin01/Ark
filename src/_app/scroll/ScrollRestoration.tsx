"use client";

import { useEffect, useRef } from "react";
import { useSsgoiTransition } from "@ssgoi/react";

import { isBackForwardLoad, loadScroll, saveScroll, scrollKey } from "./scroll-memory";

/** 화면 전환이 끝난 뒤에도 이 시간은 자리를 붙잡아 둡니다(늦게 그려지는 내용이 높이를 바꿀 수 있음). */
const SETTLE_MS = 600;
/** 이 시간이 지나면(내용이 끝내 짧으면) 되돌리기를 그만둡니다. */
const GIVE_UP_MS = 3000;

const storage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

/**
 * 뒤로·앞으로 가면 그 주소에서 보던 자리로 되돌립니다.
 * Next(`cacheComponents`)는 이전 화면을 숨겨 두었다가 다시 보여 주므로 대개 자리가 남지만,
 * 같은 경로의 다른 화면(신 → 다른 신)이나 새로고침한 뒤에는 남지 않아 따로 기억합니다.
 * 화면 전환(SSGOI)이 끝나기를 기다렸다가 되돌리고, 그사이 사용자가 직접 스크롤하면 멈춥니다.
 */
export function ScrollRestoration() {
  const { status } = useSsgoiTransition();
  const transitioning = useRef(false);
  useEffect(() => {
    transitioning.current = status === "transitioning";
  }, [status]);

  useEffect(() => {
    let restoring: { y: number; start: number; idleSince: number } | null = null;
    let restoreFrame = 0;
    let saveFrame = 0;

    const stopRestore = () => {
      restoring = null;
      cancelAnimationFrame(restoreFrame);
    };

    const step = (now: number) => {
      if (!restoring) return;
      const elapsed = now - restoring.start;
      if (transitioning.current) restoring.idleSince = 0;
      else {
        if (!restoring.idleSince) restoring.idleSince = now;
        if (Math.abs(window.scrollY - restoring.y) >= 1) {
          window.scrollTo({ top: restoring.y, left: 0, behavior: "instant" });
        }
      }
      const settled =
        restoring.idleSince > 0 &&
        now - restoring.idleSince >= SETTLE_MS &&
        Math.abs(window.scrollY - restoring.y) < 1;
      if (settled || elapsed >= GIVE_UP_MS) return stopRestore();
      restoreFrame = requestAnimationFrame(step);
    };

    const restore = () => {
      stopRestore();
      const y = loadScroll(storage(), scrollKey(window.location));
      if (y === undefined) return;
      restoring = { y, start: performance.now(), idleSince: 0 };
      restoreFrame = requestAnimationFrame(step);
    };

    const save = () => {
      if (restoring || transitioning.current) return;
      saveScroll(storage(), scrollKey(window.location), window.scrollY);
    };
    const onScroll = () => {
      cancelAnimationFrame(saveFrame);
      saveFrame = requestAnimationFrame(save);
    };

    window.addEventListener("popstate", restore);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    // 사용자가 직접 움직이면 되돌리기를 멈춥니다.
    const userInput = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    for (const type of userInput) window.addEventListener(type, stopRestore, { passive: true });

    if (isBackForwardLoad()) restore();

    return () => {
      stopRestore();
      cancelAnimationFrame(saveFrame);
      window.removeEventListener("popstate", restore);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      for (const type of userInput) window.removeEventListener(type, stopRestore);
    };
  }, []);

  return null;
}
