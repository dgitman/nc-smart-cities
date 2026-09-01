import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Stat } from "../../components";
import { pillarPath, pillars, recordsByPillarSlug, slugify } from "../../data";
import { Breadcrumbs, RecordCards } from "../../record-components";
import { absoluteUrl, BreadcrumbJsonLd, createPageMetadata, JsonLd } from "../../seo";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return pillars.map(([, pillar]) => ({ slug: slugify(pillar) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const records = recordsByPillarSlug.get(slug);
  if (!records?.length) return {};
  const pillar = records[0].pillar;
  return createPageMetadata({
    title: `${pillar} Systems`,
    description: `Explore ${records.length} source-linked North Carolina municipal technology records classified under ${pillar}.`,
    path: pillarPath(pillar),
  });
}

export default async function PillarPage({ params }: PageProps) {
  const { slug } = await params;
  const records = recordsByPillarSlug.get(slug);
  if (!records?.length) notFound();

  const pillar = records[0].pillar;
  const definition = pillars.find(([, title]) => title === pillar)?.[2] ?? "Municipal technology systems";
  const sourceCount = new Set(records.flatMap((record) => record.sources.map((source) => source.url))).size;
  const cityCount = new Set(records.map((record) => record.jurisdiction)).size;
  const aiCount = records.filter((record) => record.aiRole !== "No AI signal in published fields").length;

  return (
    <main id="main-content">
      <BreadcrumbJsonLd items={[
        { name: "Home", path: "/" },
        { name: "Civic pillars", path: "/pillars" },
        { name: pillar, path: pillarPath(pillar) },
      ]} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${pillar} Municipal Technology Systems`,
        url: absoluteUrl(pillarPath(pillar)),
        description: `${records.length} source-linked North Carolina municipal technology records classified under ${pillar}.`,
        isPartOf: { "@type": "WebSite", url: absoluteUrl("/") },
      }} />
      <section className="method-hero">
        <div className="shell narrow-shell">
          <Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Civic pillars", href: "/pillars" },
            { label: pillar },
          ]} />
          <p className="eyebrow">Civic system pillar</p>
          <h1>{pillar}</h1>
          <p className="lede">{definition}. Counts describe documented evidence in the atlas—not outcomes, rankings, or a complete statewide census.</p>
          <div className="page-stats inline-page-stats">
            <Stat value={records.length.toString()} label="records" />
            <Stat value={cityCount.toString()} label="jurisdictions" />
            <Stat value={sourceCount.toString()} label="public sources" />
            <Stat value={aiCount.toString()} label="AI-lens candidates" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Documented systems</p>
            <h2>{pillar} records across North Carolina</h2>
            <p>Open a record for its jurisdiction, lifecycle label, provenance, and supporting public evidence.</p>
          </div>
          <RecordCards records={records} />
        </div>
      </section>
    </main>
  );
}
