import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Stat } from "../../components";
import { cityPath, jurisdictions, recordsByCitySlug, slugify } from "../../data";
import { Breadcrumbs, RecordCards } from "../../record-components";
import { BreadcrumbJsonLd, createPageMetadata, JsonLd, absoluteUrl } from "../../seo";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return jurisdictions.map((jurisdiction) => ({ slug: slugify(jurisdiction) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const records = recordsByCitySlug.get(slug);
  if (!records?.length) return {};
  const jurisdiction = records[0].jurisdiction;
  return createPageMetadata({
    title: `${jurisdiction} Municipal Technology Systems`,
    description: `Explore ${records.length} source-linked smart-city and municipal technology records for ${jurisdiction}, North Carolina.`,
    path: cityPath(jurisdiction),
  });
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params;
  const records = recordsByCitySlug.get(slug);
  if (!records?.length) notFound();

  const jurisdiction = records[0].jurisdiction;
  const county = records[0].county;
  const sourceCount = new Set(records.flatMap((record) => record.sources.map((source) => source.url))).size;
  const aiCount = records.filter((record) => record.aiRole !== "No AI signal in published fields").length;
  const pillarCounts = Object.entries(
    records.reduce<Record<string, number>>((counts, record) => {
      counts[record.pillar] = (counts[record.pillar] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <main id="main-content">
      <BreadcrumbJsonLd items={[
        { name: "Home", path: "/" },
        { name: "Communities", path: "/cities" },
        { name: jurisdiction, path: cityPath(jurisdiction) },
      ]} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${jurisdiction} Municipal Technology Systems`,
        url: absoluteUrl(cityPath(jurisdiction)),
        description: `${records.length} source-linked municipal technology records associated with ${jurisdiction}, North Carolina.`,
        about: { "@type": "Place", name: `${jurisdiction}, North Carolina` },
        isPartOf: { "@type": "WebSite", url: absoluteUrl("/") },
      }} />
      <section className="method-hero">
        <div className="shell narrow-shell">
          <Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Communities", href: "/cities" },
            { label: jurisdiction },
          ]} />
          <p className="eyebrow">{county ? `${county} County` : "North Carolina"} · Place profile</p>
          <h1>{jurisdiction} municipal technology systems</h1>
          <p className="lede">
            This profile groups source-linked systems associated with {jurisdiction}. It reflects the atlas research sample and does not establish completeness, current operation, or municipal endorsement.
          </p>
          <div className="page-stats inline-page-stats">
            <Stat value={records.length.toString()} label="records" />
            <Stat value={sourceCount.toString()} label="public sources" />
            <Stat value={aiCount.toString()} label="AI-lens candidates" />
            <Stat value={pillarCounts.length.toString()} label="civic pillars" />
          </div>
        </div>
      </section>

      <section className="section section-compact">
        <div className="shell">
          <div className="pillar-summary-row" aria-label="Records by civic pillar">
            {pillarCounts.map(([pillar, count]) => (
              <span key={pillar}><strong>{count}</strong> {pillar}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Documented systems</p>
            <h2>Records associated with {jurisdiction}</h2>
            <p>Open a record for its classification, provenance, and supporting public evidence.</p>
          </div>
          <RecordCards records={records} />
        </div>
      </section>
    </main>
  );
}
