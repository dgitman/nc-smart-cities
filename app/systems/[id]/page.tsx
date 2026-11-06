import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  aiRoleLabels,
  cityPath,
  dataset,
  pillarPath,
  recordsById,
  sourceDomainFromUrl,
  systemPath,
} from "../../data";
import { Breadcrumbs, RecordCards } from "../../record-components";
import { absoluteUrl, BreadcrumbJsonLd, createPageMetadata, JsonLd } from "../../seo";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return dataset.records.map((record) => ({ id: record.id }));
}

function recordDescription(record: (typeof dataset.records)[number]): string {
  const vendor = record.vendor ? ` involving ${record.vendor}` : "";
  return `${record.initiative} in ${record.jurisdiction}, North Carolina: a source-linked ${record.technology} record${vendor} in the NC Smart-City Systems Atlas.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const record = recordsById.get(id);
  if (!record) return {};
  return createPageMetadata({
    title: `${record.initiative} in ${record.jurisdiction}`,
    description: recordDescription(record),
    path: systemPath(record),
  });
}

export default async function SystemPage({ params }: PageProps) {
  const { id } = await params;
  const record = recordsById.get(id);
  if (!record) notFound();

  const related = dataset.records
    .filter((candidate) =>
      candidate.id !== record.id &&
      candidate.jurisdiction === record.jurisdiction &&
      candidate.pillar === record.pillar,
    )
    .slice(0, 6);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Communities", path: "/cities" },
    { name: record.jurisdiction, path: cityPath(record.jurisdiction) },
    { name: record.initiative, path: systemPath(record) },
  ];

  return (
    <main id="main-content">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `${record.initiative} in ${record.jurisdiction}`,
        description: recordDescription(record),
        url: absoluteUrl(systemPath(record)),
        dateModified: dataset.metadata.generatedDate,
        isPartOf: { "@type": "WebSite", url: absoluteUrl("/") },
        mainEntity: {
          "@type": "Thing",
          name: record.initiative,
          description: record.publicNote || record.technology,
          location: { "@type": "Place", name: `${record.jurisdiction}, North Carolina` },
          citation: record.sources.map((source) => source.url),
          additionalProperty: [
            { "@type": "PropertyValue", name: "Civic pillar", value: record.pillar },
            { "@type": "PropertyValue", name: "Technology", value: record.technology },
            { "@type": "PropertyValue", name: "Lifecycle label", value: record.lifecycleStatus },
            { "@type": "PropertyValue", name: "AI role", value: record.aiRole },
          ],
        },
      }} />

      <section className="method-hero system-hero">
        <div className="shell narrow-shell">
          <Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Communities", href: "/cities" },
            { label: record.jurisdiction, href: cityPath(record.jurisdiction) },
            { label: record.initiative },
          ]} />
          <p className="eyebrow">{record.jurisdiction} · Source-linked system record</p>
          <h1>{record.initiative}</h1>
          <p className="lede">
            This atlas record classifies {record.initiative} as {record.technology.toLowerCase()} within {record.pillar.toLowerCase()}. The attached sources document why it appears in the research sample; they do not independently prove current operation or performance.
          </p>
          <div className="record-tags record-tags-large" aria-label="Record classifications">
            <a href={pillarPath(record.pillar)}>{record.pillar}</a>
            <span>{record.lifecycleStatus}</span>
            <span>{record.audience}</span>
            {record.aiRole !== "No AI signal in published fields" ? (
              <span className="tag-ai">{aiRoleLabels[record.aiRole] ?? record.aiRole}</span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell record-detail-grid">
          <article className="record-detail-main">
            <div className="section-heading">
              <p className="eyebrow">Record details</p>
              <h2>How this system is classified</h2>
            </div>
            <dl className="record-fact-grid">
              <div><dt>Jurisdiction</dt><dd><a href={cityPath(record.jurisdiction)}>{record.jurisdiction}</a></dd></div>
              <div><dt>County</dt><dd>{record.county || "Not specified"}</dd></div>
              <div><dt>Technology</dt><dd>{record.technology}</dd></div>
              <div><dt>Category</dt><dd>{record.category}</dd></div>
              <div><dt>Department</dt><dd>{record.department || "Not specified"}</dd></div>
              <div><dt>Audience</dt><dd>{record.audience}</dd></div>
              <div><dt>Vendor</dt><dd>{record.vendor || "Not specified"}</dd></div>
              <div><dt>Product</dt><dd>{record.product || "Not specified"}</dd></div>
              <div><dt>Lifecycle label</dt><dd>{record.lifecycleStatus}</dd></div>
              <div><dt>Dataset origin</dt><dd>{record.origins.join(" + ")}</dd></div>
              <div><dt>Record ID</dt><dd><code>{record.id}</code></dd></div>
              <div><dt>Dataset version</dt><dd>{dataset.metadata.version}</dd></div>
            </dl>
            {record.publicNote ? (
              <div className="record-public-note">
                <h2>Published research note</h2>
                <p>{record.publicNote}</p>
              </div>
            ) : null}
          </article>

          <aside className="evidence-panel">
            <p className="eyebrow">Public evidence</p>
            <h2>{record.sources.length} {record.sources.length === 1 ? "source" : "sources"}</h2>
            <p>Open each source and evaluate the underlying claim, date, and context.</p>
            <ol>
              {record.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {sourceDomainFromUrl(source.url)} ↗
                  </a>
                  <span>{source.type}</span>
                  <small>{source.verificationStatus}</small>
                </li>
              ))}
            </ol>
            <a className="text-link" href="/methodology">Read the evidence method →</a>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="section section-tint-blue">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">Related records</p>
              <h2>More {record.pillar.toLowerCase()} systems in {record.jurisdiction}</h2>
            </div>
            <RecordCards records={related} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
