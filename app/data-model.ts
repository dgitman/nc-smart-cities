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

export const aiRoleLabels: Record<string, string> = {
  "AI-primary or AI-dependent": "AI-primary / dependent",
  "AI-assisted workflow": "AI-assisted workflow",
  "AI-capable; use unconfirmed": "AI-capable / unconfirmed",
  "AI relevance needs review": "AI relevance needs review",
  "No AI signal in published fields": "No AI signal",
};

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

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function cityPath(jurisdiction: string): string {
  return `/cities/${slugify(jurisdiction)}`;
}

export function pillarPath(pillar: string): string {
  return `/pillars/${slugify(pillar)}`;
}

export function systemPath(record: Pick<SystemRecord, "id">): string {
  return `/systems/${encodeURIComponent(record.id)}`;
}
