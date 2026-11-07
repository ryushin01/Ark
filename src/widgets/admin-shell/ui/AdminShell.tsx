import Link from "next/link";
import { Badge, Box, Container, Flex, Link as RadixLink, Text } from "@radix-ui/themes";

import { LogoutButton } from "@/features/admin-auth";

import { AdminNav } from "./AdminNav";
import styles from "./AdminShell.module.css";

import type { AdminRole } from "@/shared/auth";
import type { ReactNode } from "react";

/** 어드민 공통 틀: 머리글(역할 표시, 사이트 보기, 로그아웃), 메뉴, 본문 */
export function AdminShell({ role, children }: { role: AdminRole; children: ReactNode }) {
  return (
    <>
      <a href="#admin-main" className={styles.skipLink}>
        본문 바로가기
      </a>
      <Box asChild className={styles.header}>
        <header>
          <Container size="4" px="4">
            <Flex justify="between" align="center" gap="3" py="3" wrap="wrap">
              <Flex align="center" gap="2">
                <Text weight="bold" size="4">
                  Ark 관리자
                </Text>
                <Badge color={role === "admin" ? "green" : "orange"} highContrast>
                  {role === "admin" ? "관리자" : "데모 · 읽기 전용"}
                </Badge>
              </Flex>
              <Flex align="center" gap="4">
                <RadixLink asChild size="2">
                  <Link href="/">사이트 보기</Link>
                </RadixLink>
                <LogoutButton />
              </Flex>
            </Flex>
            <AdminNav />
          </Container>
        </header>
      </Box>
      <Container size="4" px="4" py="6">
        <main id="admin-main" tabIndex={-1} className={styles.main}>
          {children}
        </main>
      </Container>
    </>
  );
}
