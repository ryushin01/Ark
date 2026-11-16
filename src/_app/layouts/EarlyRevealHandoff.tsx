"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    /** EarlyReveal 스크립트의 관찰(IntersectionObserver·MutationObserver). React가 넘겨받으면 끝냅니다. */
    __arkEarlyReveal?: { disconnect: () => void };
  }
}

/** React가 화면을 넘겨받으면(hydration) EarlyReveal의 관찰을 끝냅니다. 그 뒤로는 각 컴포넌트의 useInView가 맡습니다. */
export function EarlyRevealHandoff() {
  useEffect(() => {
    window.__arkEarlyReveal?.disconnect();
    delete window.__arkEarlyReveal;
  }, []);
  return null;
}
