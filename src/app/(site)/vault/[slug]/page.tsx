import { generateRelicMetadata, generateRelicParams, RelicPage } from "@/_pages/vault";

export const generateStaticParams = generateRelicParams;

export async function generateMetadata({ params }: PageProps<"/vault/[slug]">) {
  return generateRelicMetadata((await params).slug);
}

export default async function Page({ params }: PageProps<"/vault/[slug]">) {
  return <RelicPage slug={(await params).slug} />;
}
