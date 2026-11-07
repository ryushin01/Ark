import { AdminPantheonsPage } from "@/_pages/admin-pantheons";
import { firstParam } from "@/shared/lib";

export const metadata = { title: "신화 계열" };

export default async function Page({ searchParams }: PageProps<"/admin/pantheons">) {
  const { saved, deleted } = await searchParams;
  return <AdminPantheonsPage saved={firstParam(saved)} deleted={firstParam(deleted)} />;
}
