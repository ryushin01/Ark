import { type ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { Callout, Flex, Spinner } from "@radix-ui/themes";

import { getPantheons } from "@/entities/pantheon/index.server";
import { isUsingFallbackData } from "@/shared/api/index.server";
import { getAdminSession } from "@/shared/auth/index.server";
import { AdminShell } from "@/widgets/admin-shell";

async function Panel({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  // Supabase를 읽지 못해 내장 데이터로 대신 보여 주는 중이면 알립니다. (저장은 실패합니다)
  await getPantheons();
  const usingFallback = isUsingFallbackData();
  return (
    <AdminShell role={session.role}>
      {usingFallback && (
        <Callout.Root role="status" color="amber" highContrast mb="4">
          <Callout.Text>
            데이터베이스에 연결하지 못해 오프라인 데이터로 표시 중입니다. 지금은 저장할 수 없습니다.
          </Callout.Text>
        </Callout.Root>
      )}
      {children}
    </AdminShell>
  );
}

/** 로그인한 뒤의 어드민 화면. 세션(쿠키)을 읽으므로 Suspense 안에서 그립니다. */
export function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <Flex justify="center" p="9">
          <Spinner size="3" />
        </Flex>
      }
    >
      <Panel>{children}</Panel>
    </Suspense>
  );
}
