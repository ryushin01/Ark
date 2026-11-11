import { AdminGenealogyEditPage } from "@/_pages/admin-genealogies";

export const metadata = { title: "계보 고치기" };

export default async function Page({ params }: PageProps<"/admin/genealogies/[slug]">) {
  return <AdminGenealogyEditPage slug={(await params).slug} />;
}
