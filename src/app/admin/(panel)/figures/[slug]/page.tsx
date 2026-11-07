import { AdminFigureEditPage } from "@/_pages/admin-figures";

export const metadata = { title: "신 고치기" };

export default async function Page({ params }: PageProps<"/admin/figures/[slug]">) {
  return <AdminFigureEditPage slug={(await params).slug} />;
}
