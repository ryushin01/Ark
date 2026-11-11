"use client";

import { Ssgoi } from "@ssgoi/react";

import { useMotionOff } from "@/shared/lib";

import { selectConfig } from "./config";

import type { ReactNode } from "react";

/** 화면 전환(SSGOI). 라우트 경계(SsgoiRouteBoundary)는 SiteLayout의 main 안에 둡니다. */
export function PageTransitions({ children }: { children: ReactNode }) {
  const motionOff = useMotionOff();
  return <Ssgoi config={selectConfig(motionOff)}>{children}</Ssgoi>;
}
