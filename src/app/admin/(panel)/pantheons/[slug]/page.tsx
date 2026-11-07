import { AdminPantheonEditPage } from "@/_pages/admin-pantheons";

export const metadata = { title: "계열 고치기" };

export default async function Page({ params }: PageProps<"/admin/pantheons/[slug]">) {
  return <AdminPantheonEditPage slug={(await params).slug} />;
}
