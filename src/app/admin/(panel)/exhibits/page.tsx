import { AdminExhibitsPage } from "@/_pages/admin-exhibits";
import { firstParam } from "@/shared/lib";

export const metadata = { title: "소장 자료" };

export default async function Page({ searchParams }: PageProps<"/admin/exhibits">) {
  const { saved, deleted } = await searchParams;
  return <AdminExhibitsPage saved={firstParam(saved)} deleted={firstParam(deleted)} />;
}
