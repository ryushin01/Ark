import { AdminGenealogiesPage } from "@/_pages/admin-genealogies";
import { firstParam } from "@/shared/lib";

export const metadata = { title: "계보" };

export default async function Page({ searchParams }: PageProps<"/admin/genealogies">) {
  const { saved } = await searchParams;
  return <AdminGenealogiesPage saved={firstParam(saved)} />;
}
