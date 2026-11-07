import { type ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { Flex, Spinner } from "@radix-ui/themes";

import { getAdminSession } from "@/shared/auth/index.server";
import { AdminShell } from "@/widgets/admin-shell";

async function Panel({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminShell role={session.role}>{children}</AdminShell>;
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
