"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Callout, Flex, Separator, Text, TextField } from "@radix-ui/themes";

import { INITIAL_FORM_STATE } from "@/shared/lib";

import { loginAction } from "../api/actions";

/**
 * 어드민 로그인 폼
 * - 관리자: 비밀번호로 로그인하면 저장할 수 있습니다.
 * - 데모: 버튼만 누르면 둘러볼 수 있습니다. 저장은 서버에서 막습니다.
 */
export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, INITIAL_FORM_STATE);
  const passwordError = state.fieldErrors?.password?.[0];
  // 로그인 화면으로 오기 전에 보던 어드민 화면 (서버에서 다시 검사합니다)
  const next = useSearchParams().get("next") ?? "";

  return (
    <Flex direction="column" gap="5">
      {state.status === "error" && state.message && (
        <Callout.Root color="red" role="alert">
          <Callout.Text>{state.message}</Callout.Text>
        </Callout.Root>
      )}

      <form action={action}>
        <input type="hidden" name="mode" value="password" />
        <input type="hidden" name="next" value={next} />
        <Flex direction="column" gap="3">
          <Text as="label" htmlFor="admin-password" size="2" weight="medium">
            관리자 비밀번호
          </Text>
          <TextField.Root
            id="admin-password"
            name="password"
            type="password"
            size="3"
            autoComplete="current-password"
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordError ? "admin-password-error" : undefined}
          />
          {passwordError && (
            <Text id="admin-password-error" size="2" color="red">
              {passwordError}
            </Text>
          )}
          <Button type="submit" size="3" disabled={isPending}>
            {isPending ? "확인하는 중…" : "로그인"}
          </Button>
        </Flex>
      </form>

      <Flex align="center" gap="3">
        <Separator size="4" />
        <Text size="2" color="gray" style={{ whiteSpace: "nowrap" }}>
          또는
        </Text>
        <Separator size="4" />
      </Flex>

      <form action={action}>
        <input type="hidden" name="mode" value="demo" />
        <input type="hidden" name="next" value={next} />
        <Flex direction="column" gap="2">
          <Button
            type="submit"
            size="3"
            variant="soft"
            disabled={isPending}
            style={{ width: "100%" }}
          >
            데모 계정으로 둘러보기
          </Button>
          <Text size="2" color="gray">
            데모 계정은 모든 화면을 볼 수 있지만 저장은 할 수 없습니다.
          </Text>
        </Flex>
      </form>
    </Flex>
  );
}
