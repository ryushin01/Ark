import { AdminPantheonsPage } from "@/_pages/admin-pantheons";
import { firstParam } from "@/shared/lib";

export default async function Page({ searchParams }: PageProps<"/admin/pantheons">) {
  const { saved } = await searchParams;
  return <AdminPantheonsPage saved={firstParam(saved)} />;
}
