import { AdminWorksPage } from "@/_pages/admin-works";
import { firstParam } from "@/shared/lib";

export default async function Page({ searchParams }: PageProps<"/admin/works">) {
  const { saved, deleted } = await searchParams;
  return <AdminWorksPage saved={firstParam(saved)} deleted={firstParam(deleted)} />;
}
