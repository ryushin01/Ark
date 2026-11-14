import { AdminRelicsPage } from "@/_pages/admin-relics";
import { firstParam } from "@/shared/lib";

export const metadata = { title: "유물" };

export default async function Page({ searchParams }: PageProps<"/admin/relics">) {
  const { saved, deleted } = await searchParams;
  return <AdminRelicsPage saved={firstParam(saved)} deleted={firstParam(deleted)} />;
}
