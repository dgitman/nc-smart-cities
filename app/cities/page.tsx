import { PageIntro, Stat } from "../components";
import { cityPath, dataset, jurisdictions } from "../data";
import { createPageMetadata } from "../seo";

export const metadata = createPageMetadata({
  title: "North Carolina Communities",
  description:
    "Browse source-linked municipal technology systems by North Carolina city, town, and county.",
  path: "/cities",
});

const citySummaries = jurisdictions
  .map((jurisdiction) => {
    const records = dataset.records.filter((record) => record.jurisdiction === jurisdiction);
    return {
      jurisdiction,
      count: records.length,
      aiCount: records.filter((record) => record.aiRole !== "No AI signal in published fields").length,
      sources: new Set(records.flatMap((record) => record.sources.map((source) => source.url))).size,
    };
  })
  .sort((a, b) => b.count - a.count || a.jurisdiction.localeCompare(b.jurisdiction));

export default function CitiesPage() {
  return (
    <main id="main-content">
      <PageIntro
        index="05"
        eyebrow="North Carolina places"
        title="Compare municipal systems community by community."
        summary="Each page groups the atlas records and public evidence associated with one jurisdiction. Counts describe this researched sample, not a complete inventory."
        tone="blue"
      >
        <Stat value={jurisdictions.length.toString()} label="jurisdictions" />
        <Stat value={dataset.metadata.totals.records.toLocaleString()} label="source-linked records" />
        <Stat value={dataset.metadata.totals.counties.toString()} label="counties represented" />
        <Stat value={dataset.metadata.snapshotDate} label="research snapshot" />
      </PageIntro>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Place index</p>
            <h2>Browse all documented jurisdictions.</h2>
            <p>Higher counts reflect research depth in this dataset, not a municipal ranking.</p>
          </div>
          <div className="directory-grid">
            {citySummaries.map((city) => (
              <article key={city.jurisdiction}>
                <h2><a href={cityPath(city.jurisdiction)}>{city.jurisdiction}</a></h2>
                <dl>
                  <div><dt>Records</dt><dd>{city.count}</dd></div>
                  <div><dt>AI-lens candidates</dt><dd>{city.aiCount}</dd></div>
                  <div><dt>Public sources</dt><dd>{city.sources}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
