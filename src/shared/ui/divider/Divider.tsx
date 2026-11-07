"use client";

import { useRef } from "react";

import { useInView } from "@/shared/lib";

import styles from "./Divider.module.css";

/** 화면에 들어오면 왼쪽에서 오른쪽으로 펼쳐지는 1px 구분선입니다. 장식용이라 보조기기에는 숨깁니다. */
export function Divider({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={[styles.divider, isInView && styles.inView, className].filter(Boolean).join(" ")}
    />
  );
}
