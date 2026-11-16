"use client";

import { useRef, useState, useTransition } from "react";
import { AlertDialog, Button, Callout, Flex } from "@radix-ui/themes";

import type { FormState } from "@/shared/lib";

type ConfirmDeleteButtonProps = {
  /** 지울 대상 이름 (예: "제우스") */
  name: string;
  /** 삭제 Server Action. 실패하면 오류 상태를 돌려주고, 성공하면 목록으로 이동합니다. */
  onDelete: () => Promise<FormState | void>;
};

/**
 * 확인 대화상자를 거쳐 삭제합니다.
 * 두 번 보내지 않도록 누르는 순간 `useRef`로 잠급니다(`isPending`은 다음 렌더에야 바뀜).
 * 성공하면 목록으로 떠나므로 실패했을 때만 풉니다.
 */
export function ConfirmDeleteButton({ name, onDelete }: ConfirmDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);

  const remove = () => {
    if (locked.current) return;
    locked.current = true;
    startTransition(async () => {
      const result = await onDelete();
      if (result?.status === "error") {
        locked.current = false;
        setError(result.message ?? "삭제하지 못했습니다.");
      } else setError(null);
    });
  };

  return (
    <Flex direction="column" gap="2" align="start">
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button type="button" color="red" variant="soft" disabled={isPending}>
            삭제
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content maxWidth="420px">
          <AlertDialog.Title>{name}을(를) 삭제할까요?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            삭제하면 공개 사이트에서도 바로 사라지고 되돌릴 수 없습니다.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                취소
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button color="red" disabled={isPending} onClick={remove}>
                삭제
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
      {error && (
        <Callout.Root color="red" role="alert">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
}
