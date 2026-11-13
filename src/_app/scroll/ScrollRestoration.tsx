"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSsgoiTransition } from "@ssgoi/react";

import { isBackForwardLoad, loadScroll, saveScroll, scrollKey } from "./scroll-memory";

/** 화면 전환이 끝난 뒤에도 이 시간은 자리를 붙잡아 둡니다(늦게 그려지는 내용이 높이를 바꿀 수 있음). */
const SETTLE_MS = 600;
/** 이 시간이 지나면(내용이 끝내 짧으면) 붙잡기를 그만둡니다. */
const GIVE_UP_MS = 3000;

const storage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

/** 주소의 `#` 대상 요소. 없으면 null */
const hashTarget = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return id ? document.getElementById(id) : null;
};

/** 요소를 scroll-margin-top을 지켜 화면 맨 위에 둘 때의 스크롤 위치 */
const topOf = (element: HTMLElement) =>
  element.getBoundingClientRect().top +
  window.scrollY -
  (Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0);

/**
 * Next가 관리하는 기록 항목인지. 같은 화면 안의 `#` 링크(본문 바로가기, 목차)는 브라우저가 상태 없이 새 항목을 만듭니다.
 */
const isAppHistoryEntry = (state: unknown) =>
  typeof state === "object" &&
  state !== null &&
  Object.keys(state).some((key) => key.startsWith("__"));

/**
 * 스크롤 위치 되돌리기
 * - 뒤로·앞으로 가면 그 주소에서 보던 자리로 되돌립니다. Next(`cacheComponents`)는 이전 화면을 숨겨 두었다가 다시 보여 주므로
 *   대개 자리가 남지만, 같은 경로의 다른 화면(신 → 다른 신)이나 새로고침한 뒤에는 남지 않아 따로 기억합니다.
 * - 주소에 `#`이 붙은 채 화면을 열면 그 요소로 갑니다.
 * - 같은 화면 안의 `#` 이동은 브라우저에 맡깁니다(popstate가 일어나도 되돌리지 않음).
 * 어느 쪽이든 화면 전환(SSGOI)이 끝나기를 기다렸다가 자리를 잡고, 그사이 사용자가 직접 움직이면 멈춥니다.
 */
export function ScrollRestoration() {
  const { status } = useSsgoiTransition();
  const transitioning = useRef(false);
  useEffect(() => {
    transitioning.current = status === "transitioning";
  }, [status]);

  /** 자리 붙잡기를 시작하는 함수 (아래 effect가 채움) */
  const holdRef = useRef<((target: () => number | undefined) => void) | null>(null);

  useEffect(() => {
    let holding: { target: () => number | undefined; start: number; idleSince: number } | null =
      null;
    let holdFrame = 0;
    let saveFrame = 0;

    const stopHold = () => {
      holding = null;
      cancelAnimationFrame(holdFrame);
    };

    const step = (now: number) => {
      if (!holding) return;
      const y = holding.target();
      if (y === undefined || now - holding.start >= GIVE_UP_MS) return stopHold();
      if (transitioning.current) holding.idleSince = 0;
      else {
        if (!holding.idleSince) holding.idleSince = now;
        if (Math.abs(window.scrollY - y) >= 1) {
          window.scrollTo({ top: y, left: 0, behavior: "instant" });
        }
      }
      const settled =
        holding.idleSince > 0 &&
        now - holding.idleSince >= SETTLE_MS &&
        Math.abs(window.scrollY - y) < 1;
      if (settled) return stopHold();
      holdFrame = requestAnimationFrame(step);
    };

    const hold = (target: () => number | undefined) => {
      stopHold();
      holding = { target, start: performance.now(), idleSince: 0 };
      holdFrame = requestAnimationFrame(step);
    };
    holdRef.current = hold;

    const restoreSaved = () => {
      const y = loadScroll(storage(), scrollKey(window.location));
      if (y !== undefined) hold(() => y);
    };

    const onPopState = (event: PopStateEvent) => {
      // 앞서 붙잡던 자리(이전 화면의 위치)는 언제나 놓습니다.
      stopHold();
      // 같은 화면 안의 # 이동이거나 그 기록으로 돌아온 경우는 브라우저가 맡습니다.
      if (isAppHistoryEntry(event.state)) restoreSaved();
    };

    const save = () => {
      if (holding || transitioning.current) return;
      saveScroll(storage(), scrollKey(window.location), window.scrollY);
    };
    const onScroll = () => {
      cancelAnimationFrame(saveFrame);
      saveFrame = requestAnimationFrame(save);
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    // 사용자가 직접 움직이면 붙잡기를 멈춥니다.
    const userInput = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    for (const type of userInput) window.addEventListener(type, stopHold, { passive: true });

    if (isBackForwardLoad()) restoreSaved();

    return () => {
      stopHold();
      holdRef.current = null;
      cancelAnimationFrame(saveFrame);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      for (const type of userInput) window.removeEventListener(type, stopHold);
    };
  }, []);

  // 화면을 열거나 다른 화면으로 옮겼을 때 주소에 #이 있으면 그 요소로 갑니다.
  const pathname = usePathname();
  useEffect(() => {
    if (!window.location.hash || isBackForwardLoad()) return;
    holdRef.current?.(() => {
      const element = hashTarget();
      return element ? topOf(element) : undefined;
    });
  }, [pathname]);

  return null;
}
