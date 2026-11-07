import { AdminExhibitsPage } from "@/_pages/admin-exhibits";
import { firstParam } from "@/shared/lib";

export default async function Page({ searchParams }: PageProps<"/admin/exhibits">) {
  const { saved, deleted } = await searchParams;
  return <AdminExhibitsPage saved={firstParam(saved)} deleted={firstParam(deleted)} />;
}
