import { Heading, Text } from "@radix-ui/themes";

import styles from "./PageHeader.module.css";

import type { ReactNode } from "react";

/**
 * 어드민 화면 제목. 화면마다 h1 하나를 둡니다. (KWCAG 6.4.2)
 * - 기본: 왼쪽에 큰 세리프 제목, 오른쪽에 설명, 제목 아래에 알약 버튼
 * - hero: 첫 화면처럼 가운데에 아주 큰 제목과 설명
 * 제목은 아래에서 떠오르며 나타납니다(움직임 줄이기를 켜면 바로 보임).
 */
export function PageHeader({
  title,
  description,
  actions,
  hero = false,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  hero?: boolean;
}) {
  return (
    <div className={hero ? styles.hero : styles.header}>
      <div className={styles.titleBlock}>
        <Heading as="h1" className={styles.title}>
          <span className={styles.titleLine}>{title}</span>
        </Heading>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {description && (
        <Text as="p" className={styles.description}>
          {description}
        </Text>
      )}
    </div>
  );
}
