import { getFigures } from "@/entities/figure/index.server";
import { getPantheons } from "@/entities/pantheon/index.server";
import { getRelics } from "@/entities/relic/index.server";
import { features, SITE } from "@/shared/config";

import type { MetadataRoute } from "next";

/** 공개 화면 주소 목록. 어드민과 숨긴 아카이브는 넣지 않습니다. */
export async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pantheons, figures, relics] = await Promise.all([
    getPantheons(),
    getFigures(),
    getRelics(),
  ]);
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
    { url: url("/vault"), changeFrequency: "monthly", priority: 0.7 },
    ...relics.map((relic) => ({
      url: url(`/vault/${relic.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...(features.archive ? [{ url: url("/archive"), changeFrequency: "monthly" as const }] : []),
  ];
}
