import { AdminRelicEditPage } from "@/_pages/admin-relics";

export const metadata = { title: "유물 고치기" };

export default async function Page({ params }: PageProps<"/admin/relics/[slug]">) {
  return <AdminRelicEditPage slug={(await params).slug} />;
}
