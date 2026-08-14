import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter, SiteHeader } from "./components";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const LOCAL_PREVIEW_URL = new URL("http://localhost:3000");
const PRODUCTION_SITE_URL = new URL(
  "https://nc-smart-cities.dgitman.workers.dev",
);

function fallbackSiteUrl(): URL {
  return process.env.NODE_ENV === "production"
    ? PRODUCTION_SITE_URL
    : LOCAL_PREVIEW_URL;
}

function canonicalSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) return fallbackSiteUrl();

  try {
    const parsed = new URL(configuredUrl);
    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password
    ) {
      return fallbackSiteUrl();
    }
    return new URL(parsed.origin);
  } catch {
    return fallbackSiteUrl();
  }
}

export function generateMetadata(): Metadata {
  const siteUrl = canonicalSiteUrl();
  const openGraphImageUrl = new URL("/og.png", siteUrl).toString();
  const title = "NC Smart-City Systems Atlas";
  const description =
    "A source-linked community dataset of municipal technology systems in North Carolina, with AI as a reporting lens.";

  return {
    metadataBase: siteUrl,
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    alternates: { canonical: new URL("/", siteUrl).toString() },
    keywords: [
      "North Carolina",
      "smart city",
      "municipal technology",
      "municipal AI",
      "civic technology",
      "open data",
    ],
    authors: [{ name: "David Gitman" }],
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: openGraphImageUrl, width: 1744, height: 910, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [openGraphImageUrl],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
