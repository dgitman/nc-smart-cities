import { PageIntro, Stat } from "../components";
import { dataset, pillarPath, pillars } from "../data";
import { createPageMetadata } from "../seo";

export const metadata = createPageMetadata({
  title: "Civic Technology Pillars",
  description:
    "Browse North Carolina municipal technology records across six smart-city and civic-system pillars.",
  path: "/pillars",
});

export default function PillarsPage() {
  return (
    <main id="main-content">
      <PageIntro
        index="06"
        eyebrow="Shared evidence model"
        title="Six civic pillars make unlike systems comparable."
        summary="The taxonomy groups municipal technologies by the civic work they support. AI remains a reviewable characteristic of records—not a separate seventh pillar."
        tone="lime"
      >
        <Stat value="6" label="civic pillars" />
        <Stat value={dataset.metadata.totals.records.toLocaleString()} label="source-linked records" />
        <Stat value={dataset.metadata.totals.jurisdictions.toString()} label="jurisdictions" />
        <Stat value={dataset.metadata.snapshotDate} label="research snapshot" />
      </PageIntro>

      <section className="section">
        <div className="shell pillar-directory">
          {pillars.map(([number, title, description]) => (
            <article key={title}>
              <span className="prose-index">{number}</span>
              <div>
                <h2><a href={pillarPath(title)}>{title}</a></h2>
                <p>{description}</p>
                <strong>{dataset.metadata.pillars[title].toLocaleString()} records</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
