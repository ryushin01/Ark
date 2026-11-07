import { FigurePage, generateFigureMetadata, generateFigureParams } from "@/_pages/figure";

export const generateStaticParams = generateFigureParams;

export async function generateMetadata({ params }: PageProps<"/figures/[slug]">) {
  return generateFigureMetadata((await params).slug);
}

export default async function Page({ params }: PageProps<"/figures/[slug]">) {
  return <FigurePage slug={(await params).slug} />;
}
