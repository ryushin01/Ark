import { AdminWorkEditPage } from "@/_pages/admin-works";

export default async function Page({ params }: PageProps<"/admin/works/[slug]">) {
  return <AdminWorkEditPage slug={(await params).slug} />;
}
