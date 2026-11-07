import { AdminExhibitEditPage } from "@/_pages/admin-exhibits";

export const metadata = { title: "자료 고치기" };

export default async function Page({ params }: PageProps<"/admin/exhibits/[id]">) {
  return <AdminExhibitEditPage id={(await params).id} />;
}
