"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, Callout, Flex, Heading, Text } from "@radix-ui/themes";

import { reportError } from "@/shared/lib";

type ErrorPageProps = { error: unknown; retry: () => void };

/** 어드민 오류 화면 (Radix Themes). 저장 중이던 내용은 사라질 수 있음을 알립니다. */
export function AdminErrorPage({ error, retry }: ErrorPageProps) {
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  useEffect(() => {
    console.error(error);
    reportError(error);
  }, [error]);

  return (
    <Flex direction="column" gap="4" align="start" p="4" maxWidth="720px" mx="auto" mt="6">
      <Heading as="h1" size="7">
        화면을 불러오지 못했습니다
      </Heading>
      <Callout.Root color="red" role="alert" highContrast>
        <Callout.Text>
          데이터베이스나 저장소가 잠시 응답하지 않았을 수 있습니다. 다시 시도해도 같으면 잠시 뒤에
          들어와 주세요.
          {digest && ` (오류 식별자: ${digest})`}
        </Callout.Text>
      </Callout.Root>
      <Text as="p" size="2" color="gray">
        저장하던 중이었다면 저장되지 않았을 수 있습니다. 목록에서 결과를 확인해 주세요.
      </Text>
      <Flex gap="3">
        <Button onClick={() => retry()}>다시 시도</Button>
        <Button asChild variant="soft" color="gray">
          <Link href="/admin">대시보드로 가기</Link>
        </Button>
      </Flex>
    </Flex>
  );
}
