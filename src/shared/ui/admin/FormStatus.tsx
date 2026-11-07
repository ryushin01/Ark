"use client";

import { useEffect, useRef } from "react";
import { Callout } from "@radix-ui/themes";

import type { FormState } from "@/shared/lib";

/**
 * 저장 결과 안내. 오류가 나면 안내로 초점을 옮겨, 화면 낭독기 사용자도 바로 알 수 있게 합니다. (KWCAG 7.3.1)
 */
export function FormStatus({ state }: { state: FormState }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") ref.current?.focus();
  }, [state]);

  if (state.status === "idle" || !state.message) return null;
  return (
    <Callout.Root
      ref={ref}
      tabIndex={-1}
      color={state.status === "error" ? "red" : "green"}
      role={state.status === "error" ? "alert" : "status"}
    >
      <Callout.Text>{state.message}</Callout.Text>
    </Callout.Root>
  );
}
