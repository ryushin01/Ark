"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-motion"] });
  return () => {
    media.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

/** 지금 움직임을 꺼야 하는지. 이벤트 처리기처럼 훅을 쓸 수 없는 곳에서 바로 읽습니다. */
export const isMotionOff = () =>
  window.matchMedia(QUERY).matches || document.documentElement.dataset.motion === "off";

const getSnapshot = isMotionOff;

/** 움직임을 꺼야 하는지. 운영체제의 동작 줄이기와 사이트의 움직임 설정을 함께 봅니다. */
export function useMotionOff() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
