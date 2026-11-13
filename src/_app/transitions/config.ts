import { drill, fade } from "@ssgoi/react/view-transitions";

import type { SsgoiConfig } from "@ssgoi/react";

// 설정 객체는 컴포넌트 밖에 둡니다. 렌더마다 새로 만들면 전환 엔진이 다시 만들어져 저장된 스크롤 위치를 잃습니다.

/**
 * 계층을 따라 들어갈 때(홈 → 신화 계열 → 신, 목록·아카이브·유물 → 신, 전시실·신 → 유물)는 한 단계 깊어지는 drill,
 * 같은 깊이의 이동(다른 신, 다른 메뉴)은 fade. 뒤로 가거나 위 계층 링크(이동 경로)로 나오면 반대로 움직입니다.
 */
export const motionConfig: SsgoiConfig = {
  // 스크롤은 Lenis가 맡습니다. SSGOI의 입력 잠금 대신 전환하는 동안 Lenis를 멈춥니다(SmoothScroll).
  scrollLock: false,
  transitions: [
    { priority: -100, on: "/**", transition: fade() },
    { from: "/", to: "/pantheons/*", transition: drill() },
    {
      from: ["/", "/figures", "/pantheons/*", "/archive", "/vault/*"],
      to: "/figures/*",
      transition: drill(),
    },
    { from: ["/vault", "/figures/*"], to: "/vault/*", transition: drill() },
  ],
};

/** 움직임을 끄면(운영체제의 동작 줄이기, 사이트의 움직임 설정) 화면 전환을 하지 않습니다. SSGOI는 이 설정을 스스로 읽지 않습니다. */
export const reducedConfig: SsgoiConfig = { transitions: [] };

export const selectConfig = (motionOff: boolean) => (motionOff ? reducedConfig : motionConfig);
