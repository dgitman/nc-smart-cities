import datasetJson from "../public/data/smart-city-systems.json";
import summaryJson from "../public/data/data-summary.json";
import type { SystemRecord } from "./data-model";
import { slugify } from "./data-model";

export {
  aiRoleLabels,
  cityPath,
  pillarPath,
  slugify,
  sourceDomainFromUrl,
  systemPath,
} from "./data-model";
export type { SourceRecord, SystemRecord } from "./data-model";

export type DatasetSummary = typeof summaryJson;

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

export const jurisdictions = [
  ...new Set(dataset.records.map((record) => record.jurisdiction)),
].sort();

export const recordsById = new Map(
  dataset.records.map((record) => [record.id, record] as const),
);

export const recordsByCitySlug = new Map<string, SystemRecord[]>();
export const recordsByPillarSlug = new Map<string, SystemRecord[]>();

for (const record of dataset.records) {
  const cityKey = slugify(record.jurisdiction);
  recordsByCitySlug.set(cityKey, [
    ...(recordsByCitySlug.get(cityKey) ?? []),
    record,
  ]);

  const pillarKey = slugify(record.pillar);
  recordsByPillarSlug.set(pillarKey, [
    ...(recordsByPillarSlug.get(pillarKey) ?? []),
    record,
  ]);
}
