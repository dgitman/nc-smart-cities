import type { MetadataRoute } from "next";
import {
  cityPath,
  dataset,
  pillarPath,
  pillars,
  systemPath,
} from "./data";
import { absoluteUrl, indexingAllowed } from "./seo";

const CORE_ROUTES = [
  "/",
  "/explore",
  "/ai",
  "/cities",
  "/pillars",
  "/sources",
  "/methodology",
  "/contribute",
  "/about",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexingAllowed()) return [];

  const lastModified = new Date(`${dataset.metadata.generatedDate}T00:00:00.000Z`);
  const jurisdictions = [...new Set(dataset.records.map((record) => record.jurisdiction))].sort();

  return [
    ...CORE_ROUTES.map((path, index) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: index === 0 ? "weekly" as const : "monthly" as const,
      priority: index === 0 ? 1 : path === "/explore" ? 0.9 : 0.7,
    })),
    ...jurisdictions.map((jurisdiction) => ({
      url: absoluteUrl(cityPath(jurisdiction)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...pillars.map(([, pillar]) => ({
      url: absoluteUrl(pillarPath(pillar)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...dataset.records.map((record) => ({
      url: absoluteUrl(systemPath(record)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
