import { AdminFiguresPage } from "@/_pages/admin-figures";
import { firstParam } from "@/shared/lib";

export const metadata = { title: "신·인물" };

export default async function Page({ searchParams }: PageProps<"/admin/figures">) {
  const { pantheon, saved, deleted } = await searchParams;
  return (
    <AdminFiguresPage
      pantheon={firstParam(pantheon)}
      saved={firstParam(saved)}
      deleted={firstParam(deleted)}
    />
  );
}
