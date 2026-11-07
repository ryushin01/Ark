import { AdminPantheonEditPage } from "@/_pages/admin-pantheons";

export default async function Page({ params }: PageProps<"/admin/pantheons/[slug]">) {
  return <AdminPantheonEditPage slug={(await params).slug} />;
}
