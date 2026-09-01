import { Arrow, PageIntro, Stat } from "../components";
import { dataset } from "../data";
import { createPageMetadata } from "../seo";

export const metadata = createPageMetadata({
  title: "About the Atlas",
  description:
    "About the independent NC Smart-City Systems Atlas, its creator, research scope, version, and suggested citation.",
  path: "/about",
});

export default function AboutPage() {
  const citation = `Gitman, David. NC Smart-City Systems Atlas. Version ${dataset.metadata.version}, research snapshot ${dataset.metadata.snapshotDate}. https://nc-smart-cities.dgitman.workers.dev/`;

  return (
    <main id="main-content">
      <PageIntro
        index="07"
        eyebrow="Independent community project"
        title="A public-evidence atlas built to be examined and corrected."
        summary="David Gitman initiated the atlas from 2026 municipal internship research. It is an independent community-project prototype—not an official municipal, Town of Apex, or Wake Tech publication."
        tone="blue"
      >
        <Stat value={dataset.metadata.version} label="dataset version" />
        <Stat value={dataset.metadata.snapshotDate} label="research snapshot" />
        <Stat value={dataset.metadata.generatedDate} label="release generated" />
        <Stat value={dataset.metadata.totals.publicSources.toString()} label="public sources" />
      </PageIntro>

      <section className="section">
        <div className="shell prose-stack about-prose">
          <section>
            <p className="eyebrow">Purpose</p>
            <h2>Make municipal technology evidence easier to trace.</h2>
            <p>
              The atlas merges smart-city and municipal-AI research into one source-linked model. Its six civic pillars support comparison without treating unlike technologies as interchangeable, and its AI lens separates documented use from product capability and unresolved classification.
            </p>
          </section>
          <section>
            <p className="eyebrow">Scope and independence</p>
            <h2>A researched sample—not a statewide census or endorsement.</h2>
            <p>
              Research depth varies by jurisdiction. A visible source explains why a record was included; it does not prove that a system remains active, effective, endorsed, or complete. Private links, personal contacts, sensitive raw notes, and records without safe public evidence are excluded.
            </p>
            <a className="text-link" href="/methodology">Read the complete method and limitations <Arrow /></a>
          </section>
          <section>
            <p className="eyebrow">Suggested citation</p>
            <h2>Cite the version and research snapshot.</h2>
            <blockquote className="citation-block">{citation}</blockquote>
            <p>No reuse license is asserted on this prototype page. Review the project governance and contact the project owner before assuming reuse rights beyond applicable law.</p>
          </section>
          <section>
            <p className="eyebrow">Downloads</p>
            <h2>Use the format that fits the review.</h2>
            <div className="button-row">
              <a className="button button-primary" href="/data/smart-city-systems.json" download>JSON dataset</a>
              <a className="button button-secondary" href="/data/smart-city-systems.csv" download>CSV dataset</a>
              <a className="button button-secondary" href="/data/nc-smart-city-systems-community-dataset.xlsx" download>XLSX dataset</a>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
