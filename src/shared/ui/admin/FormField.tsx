import { Flex, Text } from "@radix-ui/themes";

import { VisuallyHidden } from "../visually-hidden";

import type { ReactNode } from "react";

type FormFieldProps = {
  /** 입력 요소의 id. label의 htmlFor와 연결합니다. */
  id: string;
  label: string;
  /** 입력 방법 안내 (KWCAG 7.3.2 레이블, 5.3.3 명확한 지시) */
  hint?: string;
  error?: string;
  required?: boolean;
  /** 안내·오류 id를 받아 입력 요소에 aria-describedby로 연결합니다. */
  children: (describedBy: string | undefined, isInvalid: boolean) => ReactNode;
};

/** 레이블, 안내, 오류 메시지를 입력 요소와 연결하는 칸 (Radix Themes) */
export function FormField({ id, label, hint, error, required, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : null;
  const errorId = error ? `${id}-error` : null;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <Flex direction="column" gap="1">
      <Text as="label" htmlFor={id} size="2" weight="medium">
        {label}
        {required && (
          <Text color="red" aria-hidden="true">
            {" "}
            *
          </Text>
        )}
        {required && <VisuallyHidden> (필수)</VisuallyHidden>}
      </Text>
      {children(describedBy, Boolean(error))}
      {hint && (
        <Text id={hintId ?? undefined} size="1" color="gray">
          {hint}
        </Text>
      )}
      {error && (
        <Text id={errorId ?? undefined} size="2" color="red" aria-live="polite">
          {error}
        </Text>
      )}
    </Flex>
  );
}
