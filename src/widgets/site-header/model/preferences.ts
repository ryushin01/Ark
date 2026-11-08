"use client";

import { useSyncExternalStore } from "react";

export type Preference = "annotations" | "motion";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["data-annotations", "data-motion"],
  });
  return () => observer.disconnect();
}

/** 화면 설정(주석, 움직임). html의 data 속성과 브라우저 저장소에 둡니다. 기본은 켬입니다. */
export function usePreference(name: Preference) {
  const isOn = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset[name] !== "off",
    () => true,
  );
  const toggle = () => {
    const next = !isOn;
    if (next) delete document.documentElement.dataset[name];
    else document.documentElement.dataset[name] = "off";
    try {
      if (next) localStorage.removeItem(`ark-${name}`);
      else localStorage.setItem(`ark-${name}`, "off");
    } catch {
      // 저장소를 막아 둔 브라우저에서는 이번 방문에만 적용합니다.
    }
  };
  return [isOn, toggle] as const;
}
