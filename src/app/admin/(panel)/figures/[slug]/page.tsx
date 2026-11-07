import { AdminFigureEditPage } from "@/_pages/admin-figures";

export default async function Page({ params }: PageProps<"/admin/figures/[slug]">) {
  return <AdminFigureEditPage slug={(await params).slug} />;
}
