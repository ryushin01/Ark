import { Flex, Heading, Text } from "@radix-ui/themes";

import type { ReactNode } from "react";

/** 어드민 화면 제목. 화면마다 h1 하나를 둡니다. (KWCAG 6.4.2) */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <Flex justify="between" align={{ initial: "start", sm: "end" }} gap="4" wrap="wrap" mb="5">
      <Flex direction="column" gap="1">
        <Heading as="h1" size="7">
          {title}
        </Heading>
        {description && (
          <Text as="p" color="gray" size="2">
            {description}
          </Text>
        )}
      </Flex>
      {actions}
    </Flex>
  );
}
