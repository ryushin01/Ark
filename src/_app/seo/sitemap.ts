import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { features, SITE } from "@/shared/config";

import type { MetadataRoute } from "next";

/** 공개 화면 주소 목록. 어드민과 숨긴 아카이브는 넣지 않습니다. */
export async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pantheons, figures] = await Promise.all([getPantheons(), getFigures()]);
  const url = (path: string) => new URL(path, SITE.url).toString();
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/figures"), changeFrequency: "weekly", priority: 0.7 },
    ...pantheons.map((pantheon) => ({
      url: url(`/pantheons/${pantheon.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...figures.map((figure) => ({
      url: url(`/figures/${figure.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...(features.archive ? [{ url: url("/archive"), changeFrequency: "monthly" as const }] : []),
  ];
}
