import Link from "next/link";
import { Arrow, MethodFlow, Pill } from "../components";
import { summary } from "../data";

export const metadata = {
  title: "Method & Limitations",
  description:
    "How the NC Smart-City Systems Atlas merges records, handles sources, classifies AI, and protects private information.",
};

export default function MethodologyPage() {
  return (
    <main id="main-content">
      <section className="method-hero">
        <div className="shell narrow-shell">
          <p className="eyebrow">Method, safety & limitations</p>
          <h1>Transparent enough to challenge. Structured enough to update.</h1>
          <p className="lede">
            The value of this project is not a fixed ranking. It is a
            source-linked evidence model that can be audited, corrected, and
            refreshed without exposing private material.
          </p>
          <div className="inline-pills">
            <Pill>Version {summary.version}</Pill>
            <Pill>Snapshot · July 2026</Pill>
            <Pill>Public sources required</Pill>
            <Pill>Community-preview prototype</Pill>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell method-page-grid">
          <aside className="method-aside">
            <p className="eyebrow">Research workflow</p>
            <MethodFlow />
          </aside>
          <div className="prose-stack">
            <section>
              <span className="prose-index">01</span>
              <h2>One system model</h2>
              <p>
                The Smart City and Municipal AI tables are merged into one
                schema. AI is stored as a role and review status on a municipal
                system record, not as a parallel city category. The Smart City
                study’s six civic pillars remain the shared taxonomy.
              </p>
            </section>
            <section>
              <span className="prose-index">02</span>
              <h2>Public-source gate</h2>
              <p>
                A record enters the public dataset only when at least one safe,
                public HTTP(S) source remains. Internal collaboration links,
                personal drives, login endpoints, local network addresses,
                URLs carrying secret-like parameters, and non-web links are
                rejected before export. Rejected URL values are never copied
                into the site or audit report.
              </p>
              <p>
                In this snapshot, {summary.quality.recordsExcludedWithoutSafePublicSource} source rows were withheld
                because their link was private/internal or missing. Personal
                contact columns and raw working notes are not part of the public
                schema.
              </p>
            </section>
            <section>
              <span className="prose-index">03</span>
              <h2>Conservative merge rules</h2>
              <p>
                Exact normalized duplicates are collapsed only when core
                identity fields and the canonical public source agree. Across
                the two studies, automatic merges require a one-to-one match on
                jurisdiction plus product/source, or vendor/product with a
                compatible pillar. Shared source pages alone are not enough.
              </p>
              <p>
                The current build collapsed {summary.quality.exactDuplicatesCollapsed} exact duplicate rows and merged {summary.quality.aiRowsMergedIntoSmartCity} unambiguous AI records into an existing
                Smart City record. Ambiguous candidates remain separate for
                human review.
              </p>
            </section>
            <section>
              <span className="prose-index">04</span>
              <h2>AI is a reviewable classification</h2>
              <p>
                The atlas separates explicit AI-primary or AI-dependent
                systems, AI-assisted workflows, AI-capable platforms with
                unconfirmed use, and records whose AI relevance needs review.
                Vendor capability is not promoted into a deployment claim.
                Analytics, cameras, automation, and “smart” branding do not
                become AI solely through keywords.
              </p>
              <p>
                {summary.quality.aiPlaceholderRowsExcluded} jurisdiction-level AI workbook placeholders without a named system were
                excluded from initiative counts. They may support future
                coverage reporting, but they are not municipal system records.
              </p>
            </section>
            <section>
              <span className="prose-index">05</span>
              <h2>Lifecycle stays unknown unless evidence says otherwise</h2>
              <p>
                Operational, pilot, in-progress, planned/budgeted, retired, and
                unconfirmed are distinct states. The classifier uses explicit
                source language where available; a budget, proposal, or vendor
                feature does not become an operational deployment.
              </p>
            </section>
            <section>
              <span className="prose-index">06</span>
              <h2>AI-assisted research disclosure</h2>
              <p>
                Generative AI tools supported parts of the original comparative
                analysis and drafting workflow. The public dataset treats source
                records as the provenance layer, labels AI-related inferences as
                reviewable classifications, and does not present model-generated
                recommendations as municipal decisions.
              </p>
            </section>
          </div>
        </div>
      </section>

      <section className="section section-warn">
        <div className="shell release-grid">
          <div>
            <p className="eyebrow">Evidence standard</p>
            <h2>“Documented” is deliberately narrow.</h2>
            <p>
              A record means that public evidence was found and normalized. It
              does not establish current operation, effectiveness, procurement
              compliance, public value, equity, safety, or community legitimacy.
            </p>
          </div>
          <ol className="release-list">
            <li><span>01</span>Open the linked source and identify the exact claim.</li>
            <li><span>02</span>Prefer jurisdiction-specific official confirmation.</li>
            <li><span>03</span>Record lifecycle and evidence date when available.</li>
            <li><span>04</span>Keep vendor claims distinct from municipal confirmation.</li>
            <li><span>05</span>Add privacy and civil-rights context for surveillance systems.</li>
            <li><span>06</span>Publish corrections through a dated changelog.</li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="shell boundary-grid">
          <div>
            <p className="eyebrow">Known limitations</p>
            <h2>What the dataset cannot say alone.</h2>
          </div>
          <div className="boundary-list">
            <article>
              <h3>It is a sample, not a census</h3>
              <p>The original scope statements and working rows do not perfectly align.</p>
            </article>
            <article>
              <h3>Research depth varies</h3>
              <p>Apex received closer inspection, which can increase its apparent breadth.</p>
            </article>
            <article>
              <h3>Public sources can lag</h3>
              <p>A missing record may mean missing evidence; an old page may describe a retired system.</p>
            </article>
            <article>
              <h3>Rows are not outcomes</h3>
              <p>Technology counts do not establish savings, service quality, legitimacy, or harm.</p>
            </article>
            <article>
              <h3>Source types differ</h3>
              <p>Official pages, vendor case studies, news reports, and research indexes carry different weight.</p>
            </article>
            <article>
              <h3>Classification needs review</h3>
              <p>Lifecycle, AI role, and duplicate candidates remain explicit community-review queues.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="shell final-cta">
          <p className="eyebrow">Inspect and improve</p>
          <h2>Trace a claim, then make the record stronger.</h2>
          <div className="button-row">
            <Link className="button button-light" href="/sources">
              Browse sources <Arrow />
            </Link>
            <Link className="button button-outline-light" href="/contribute">
              Contribution guide <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
