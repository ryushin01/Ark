import { SITE } from "@/shared/config";

import type { MetadataRoute } from "next";

/** 어드민과 API는 검색에서 뺍니다. */
export function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: new URL("/sitemap.xml", SITE.url).toString(),
  };
}
