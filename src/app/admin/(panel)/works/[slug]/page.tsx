import { AdminWorkEditPage } from "@/_pages/admin-works";

export const metadata = { title: "작품 고치기" };

export default async function Page({ params }: PageProps<"/admin/works/[slug]">) {
  return <AdminWorkEditPage slug={(await params).slug} />;
}
