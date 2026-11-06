import type { MetadataRoute } from "next";
import { absoluteUrl, canonicalSiteUrl, indexingAllowed } from "./seo";

export default function robots(): MetadataRoute.Robots {
  const allowIndexing = indexingAllowed();
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(allowIndexing ? { sitemap: absoluteUrl("/sitemap.xml") } : {}),
    host: canonicalSiteUrl().origin,
  };
}
