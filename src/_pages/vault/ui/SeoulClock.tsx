"use client";

import { useSyncExternalStore } from "react";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(timer);
}

const now = () => format.format(new Date());

/** 서울의 지금 시각(시:분). 서버에서는 시각을 모르므로 자리만 그려 두고, 브라우저에서 채운 뒤 15초마다 맞춥니다. */
export function SeoulClock() {
  const time = useSyncExternalStore(subscribe, now, () => "--:--");
  return (
    <time lang="en" suppressHydrationWarning>
      {time} KST
    </time>
  );
}
