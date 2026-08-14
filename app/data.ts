import datasetJson from "../public/data/smart-city-systems.json";
import summaryJson from "../public/data/data-summary.json";

export type SourceRecord = {
  url: string;
  domain: string;
  type: string;
  verificationStatus: string;
  origin: string;
};

export type SystemRecord = {
  id: string;
  jurisdiction: string;
  county: string;
  population: number | null;
  populationYear: number | null;
  initiative: string;
  pillar: string;
  category: string;
  technology: string;
  department: string;
  audience: string;
  vendor: string;
  product: string;
  lifecycleStatus: string;
  aiRole: string;
  publicNote: string;
  genAiOnHomepage?: boolean;
  origins: string[];
  sources: SourceRecord[];
};

export type DatasetSummary = typeof summaryJson;

export function sourceDomainFromUrl(sourceUrl: string): string {
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Invalid source";
    }
    return parsed.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "Invalid source";
  }
}

export const dataset = datasetJson as {
  metadata: DatasetSummary;
  records: SystemRecord[];
};

export const summary = summaryJson as DatasetSummary;

export const pillars = [
  ["01", "Civic & Community", "Resident services, engagement, access"],
  ["02", "Digital Governance & Technology", "Data, GIS, platforms, policy"],
  ["03", "Economy & Administration", "ERP, finance, performance"],
  ["04", "Infrastructure & Utilities", "Water, energy, assets"],
  ["05", "Mobility & Transport", "Signals, parking, fleets"],
  ["06", "Safety & Resilience", "Response, environment, continuity"],
] as const;

export const aiRoleLabels: Record<string, string> = {
  "AI-primary or AI-dependent": "AI-primary / dependent",
  "AI-assisted workflow": "AI-assisted workflow",
  "AI-capable; use unconfirmed": "AI-capable / unconfirmed",
  "AI relevance needs review": "AI relevance needs review",
  "No AI signal in published fields": "No AI signal",
};
