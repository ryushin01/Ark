import { AdminExhibitEditPage } from "@/_pages/admin-exhibits";

export default async function Page({ params }: PageProps<"/admin/exhibits/[id]">) {
  return <AdminExhibitEditPage id={(await params).id} />;
}
