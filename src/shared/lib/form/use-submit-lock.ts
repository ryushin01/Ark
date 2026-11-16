"use client";

import { type FormEvent, useEffect, useRef } from "react";

import type { FormState } from "./form-state";

/**
 * 폼을 두 번 보내지 않게 막는 잠금. `<form action={action} onSubmit={lock}>`처럼 씁니다.
 * - `isPending`은 다음 렌더에야 바뀌어 빠른 연속 클릭을 막지 못하므로, 보내는 순간 `useRef`로 잠급니다.
 *   잠겨 있으면 submit 이벤트의 기본 동작을 막고, React는 그 제출의 액션을 부르지 않습니다.
 * - 저장에 성공하면 화면을 떠나는 폼은 실패했을 때만 풉니다.
 *   같은 화면에 머무는 폼(이미지 추가 등)은 `releaseOnSuccess`로 성공해도 풉니다.
 */
export function useSubmitLock(
  state: FormState,
  { releaseOnSuccess = false }: { releaseOnSuccess?: boolean } = {},
) {
  const locked = useRef(false);

  // 액션이 끝나 새 상태가 오면(오류, 또는 머무는 폼의 성공) 다시 보낼 수 있게 합니다.
  useEffect(() => {
    if (state.status === "error" || (releaseOnSuccess && state.status === "success")) {
      locked.current = false;
    }
  }, [state, releaseOnSuccess]);

  return (event: FormEvent<HTMLFormElement>) => {
    if (locked.current) {
      event.preventDefault();
      return;
    }
    locked.current = true;
  };
}
