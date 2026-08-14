import Link from "next/link";
import { Arrow, MethodFlow, Stat } from "./components";
import { pillars, summary } from "./data";

export const metadata = {
  title: "NC Smart-City Systems Atlas",
  description:
    "Explore a source-linked community dataset of municipal technology systems in North Carolina, including an AI reporting lens.",
};

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero home-hero">
        <div className="shell hero-grid">
          <div className="hero-copy reveal">
            <p className="eyebrow">North Carolina · Community evidence atlas</p>
            <h1>A smart city is a portfolio, not a product.</h1>
            <p className="lede">
              Explore documented municipal systems across services, governance,
              infrastructure, mobility, and resilience. AI appears where it
              belongs: as a cross-cutting lens inside the larger civic system.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/explore">
                Explore {summary.totals.records.toLocaleString()} records <Arrow />
              </Link>
              <Link className="button button-secondary" href="/contribute">
                Help improve the atlas
              </Link>
            </div>
          </div>

          <div className="hero-figure reveal delay-1" aria-label="Source-linked systems map motif">
            <div className="signal-map" aria-hidden="true">
              <span className="signal signal-1" />
              <span className="signal signal-2" />
              <span className="signal signal-3" />
              <span className="signal signal-4" />
              <span className="signal signal-5" />
              <span className="signal signal-6" />
              <span className="signal signal-7" />
              <span className="signal signal-8" />
              <span className="signal signal-9" />
            </div>
            <div className="figure-caption">
              <span>Public evidence only</span>
              <strong>Systems → sources → community review</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stat-strip" aria-label="Atlas overview">
        <div className="shell stat-grid stat-grid-four">
          <Stat value={summary.totals.records.toLocaleString()} label="source-linked records" />
          <Stat value={summary.totals.jurisdictions.toString()} label="jurisdictions" />
          <Stat value={summary.totals.publicSources.toLocaleString()} label="distinct public sources" />
          <Stat value={summary.totals.aiTaggedRecords.toLocaleString()} label="AI-lens candidates" />
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">The civic system</p>
            <h2>Six pillars. One shared evidence model.</h2>
            <p>
              The taxonomy keeps unlike systems comparable without pretending
              they solve the same problem. Counts represent evidence records,
              not outcomes, endorsements, or a complete statewide census.
            </p>
          </div>
          <div className="pillar-grid">
            {pillars.map(([number, title, description]) => (
              <article key={title}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <strong className="pillar-count">
                  {summary.pillars[title as keyof typeof summary.pillars].toLocaleString()} records
                </strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint-blue">
        <div className="shell lens-grid">
          <div>
            <p className="eyebrow">AI reporting lens</p>
            <h2>AI is a characteristic of systems—not a separate city.</h2>
            <p className="large-copy">
              The atlas distinguishes explicit AI, AI-assisted workflows,
              AI-capable platforms with unconfirmed use, and records that still
              need human classification. That keeps product capability from
              being mistaken for active municipal deployment.
            </p>
            <Link className="text-link" href="/ai">
              Read the AI report <Arrow />
            </Link>
          </div>
          <div className="lens-card">
            <span className="panel-kicker">Current AI lens</span>
            <strong>{summary.totals.aiTaggedRecords.toLocaleString()}</strong>
            <p>candidate records across {summary.totals.aiTaggedJurisdictions} jurisdictions</p>
            <dl>
              <div>
                <dt>Explicit AI-primary/dependent</dt>
                <dd>{summary.aiRoles["AI-primary or AI-dependent"]}</dd>
              </div>
              <div>
                <dt>Needs classification review</dt>
                <dd>{summary.aiRoles["AI relevance needs review"]}</dd>
              </div>
              <div>
                <dt>GenAI visible on a homepage</dt>
                <dd>{summary.totals.genAiHomepageJurisdictions}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="shell method-grid">
          <div className="section-heading section-heading-light">
            <p className="eyebrow">Evidence before claims</p>
            <h2>Every published record keeps its source attached.</h2>
            <p>
              Internal links, personal contacts, raw sensitive notes, and
              records without a safe public source are excluded from the
              public-facing dataset.
            </p>
          </div>
          <MethodFlow />
        </div>
      </section>

      <section className="section">
        <div className="shell split-callout">
          <div>
            <p className="eyebrow">Built to be corrected</p>
            <h2>Research becomes infrastructure when others can improve it.</h2>
          </div>
          <div>
            <p className="large-copy">
              The community model accepts additions, corrections, stronger
              public evidence, lifecycle updates, and AI-classification review.
              Each proposal must preserve provenance and avoid private material.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/contribute">
                Contribution guide <Arrow />
              </Link>
              <Link className="button button-secondary" href="/sources">
                Browse source registry
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
