import { Suspense } from "react";
import Link from "next/link";
import { Card, Container, Flex, Heading, Link as RadixLink, Text } from "@radix-ui/themes";

import { LoginForm } from "@/features/admin-auth";

export const adminLoginMetadata = { title: "관리자 로그인", robots: { index: false } };

/** 어드민 로그인 */
export function AdminLoginPage() {
  return (
    <Container size="1" px="4" py="9">
      <main>
        <Flex direction="column" gap="5">
          <Flex direction="column" gap="2">
            <Heading as="h1" size="7">
              Ark 관리자
            </Heading>
            <Text color="gray" size="2">
              세계 신화 도서관의 계열, 신, 자료, 작품을 관리합니다.
            </Text>
          </Flex>
          <Card size="3">
            {/* 주소의 next 값을 읽으므로 Suspense 안에서 그립니다. */}
            <Suspense>
              <LoginForm />
            </Suspense>
          </Card>
          <RadixLink asChild size="2">
            <Link href="/">← 사이트로 돌아가기</Link>
          </RadixLink>
        </Flex>
      </main>
    </Container>
  );
}
