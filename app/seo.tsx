import type { Metadata } from "next";
import { summary } from "./data";

export const SITE_NAME = "NC Smart-City Systems Atlas";
export const SITE_DESCRIPTION =
  "A source-linked community dataset of municipal technology systems in North Carolina, with AI as a reporting lens.";
export const PRODUCTION_SITE_URL = new URL(
  "https://nc-smart-cities.dgitman.workers.dev",
);

const LOCAL_PREVIEW_URL = new URL("http://localhost:3000");

export function indexingAllowed(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
}

export function canonicalSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) {
    return process.env.NODE_ENV === "production"
      ? PRODUCTION_SITE_URL
      : LOCAL_PREVIEW_URL;
  }

  try {
    const parsed = new URL(configuredUrl);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password
    ) {
      return process.env.NODE_ENV === "production"
        ? PRODUCTION_SITE_URL
        : LOCAL_PREVIEW_URL;
    }
    return new URL(parsed.origin);
  } catch {
    return process.env.NODE_ENV === "production"
      ? PRODUCTION_SITE_URL
      : LOCAL_PREVIEW_URL;
  }
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, canonicalSiteUrl()).toString();
}

function pageTitle(title: string): string {
  return title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
}

function verificationMetadata(): Metadata["verification"] | undefined {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

export function robotsMetadata(): Metadata["robots"] {
  const allowIndexing = indexingAllowed();
  return {
    index: allowIndexing,
    follow: allowIndexing,
    googleBot: {
      index: allowIndexing,
      follow: allowIndexing,
      ...(allowIndexing
        ? {
            "max-image-preview": "large" as const,
            "max-snippet": -1,
            "max-video-preview": -1,
          }
        : {}),
    },
  };
}

export function createRootMetadata(): Metadata {
  const siteUrl = canonicalSiteUrl();
  const imageUrl = new URL("/og.png", siteUrl).toString();

  return {
    metadataBase: siteUrl,
    applicationName: SITE_NAME,
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    authors: [{ name: "David Gitman", url: new URL("/about", siteUrl).toString() }],
    creator: "David Gitman",
    category: "Civic technology",
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    robots: robotsMetadata(),
    verification: verificationMetadata(),
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      type: "website",
      url: siteUrl.toString(),
      siteName: SITE_NAME,
      locale: "en_US",
      images: [{ url: imageUrl, width: 1730, height: 909, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [{ url: imageUrl, alt: SITE_NAME }],
    },
  };
}

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const canonical = absoluteUrl(path);
  const socialTitle = pageTitle(title);
  const imageUrl = absoluteUrl("/og.png");

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots: robotsMetadata(),
    openGraph: {
      title: socialTitle,
      description,
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [{ url: imageUrl, width: 1730, height: 909, alt: socialTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [{ url: imageUrl, alt: socialTitle }],
    },
  };
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; path: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function SiteStructuredData() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${absoluteUrl("/")}#website`,
            name: SITE_NAME,
            description: SITE_DESCRIPTION,
            url: absoluteUrl("/"),
            inLanguage: "en-US",
            creator: { "@type": "Person", name: "David Gitman" },
          },
          {
            "@type": "Dataset",
            "@id": `${absoluteUrl("/")}#dataset`,
            name: summary.title,
            description: summary.description,
            url: absoluteUrl("/"),
            identifier: `nc-smart-city-systems-${summary.version}`,
            version: summary.version,
            dateModified: summary.generatedDate,
            temporalCoverage: summary.snapshotDate,
            inLanguage: "en-US",
            isAccessibleForFree: true,
            creator: { "@type": "Person", name: "David Gitman" },
            spatialCoverage: {
              "@type": "Place",
              name: "North Carolina, United States",
            },
            subjectOf: absoluteUrl("/methodology"),
            keywords: [
              "North Carolina smart cities",
              "municipal technology",
              "municipal AI",
              "civic technology",
              "open data",
            ],
            distribution: [
              {
                "@type": "DataDownload",
                encodingFormat: "application/json",
                contentUrl: absoluteUrl("/data/smart-city-systems.json"),
              },
              {
                "@type": "DataDownload",
                encodingFormat: "text/csv",
                contentUrl: absoluteUrl("/data/smart-city-systems.csv"),
              },
              {
                "@type": "DataDownload",
                encodingFormat:
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                contentUrl: absoluteUrl(
                  "/data/nc-smart-city-systems-community-dataset.xlsx",
                ),
              },
            ],
          },
        ],
      }}
    />
  );
}
