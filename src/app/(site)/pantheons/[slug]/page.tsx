import { generatePantheonMetadata, generatePantheonParams, PantheonPage } from "@/_pages/pantheon";

export const generateStaticParams = generatePantheonParams;

export async function generateMetadata({ params }: PageProps<"/pantheons/[slug]">) {
  return generatePantheonMetadata((await params).slug);
}

export default async function Page({ params }: PageProps<"/pantheons/[slug]">) {
  return <PantheonPage slug={(await params).slug} />;
}
