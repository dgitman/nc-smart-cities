import Link from "next/link";
import { Arrow, PageIntro, RatioBar, Stat } from "../components";
import { dataset, summary } from "../data";

export const metadata = {
  title: "AI Report",
  description:
    "A conservative reporting lens on AI signals inside North Carolina municipal smart-city systems.",
};

const aiRecords = dataset.records.filter(
  (record) => record.aiRole !== "No AI signal in published fields",
);

const explicitAiRecords = aiRecords.filter(
  (record) => record.aiRole === "AI-primary or AI-dependent",
);

const homepageJurisdictions = [
  ...new Set(
    dataset.records
      .filter((record) => record.genAiOnHomepage)
      .map((record) => record.jurisdiction),
  ),
].sort();

const aiByPillar = Object.entries(
  aiRecords.reduce<Record<string, number>>((counts, record) => {
    counts[record.pillar] = (counts[record.pillar] ?? 0) + 1;
    return counts;
  }, {}),
).sort((a, b) => b[1] - a[1]);

export default function AIReportPage() {
  return (
    <main id="main-content">
      <PageIntro
        index="02"
        eyebrow="Cross-cutting report · AI"
        title="AI is a subset of the municipal system."
        summary="This report filters the same atlas used for every other system. It separates explicit AI evidence from AI-assisted workflows, capability claims, and records that still need human review."
        tone="blue"
      >
        <Stat value={summary.totals.aiTaggedRecords.toString()} label="AI-lens candidates" />
        <Stat value={explicitAiRecords.length.toString()} label="explicit AI-primary" />
        <Stat value={summary.totals.aiTaggedJurisdictions.toString()} label="jurisdictions represented" />
        <Stat value={homepageJurisdictions.length.toString()} label="GenAI homepages" />
      </PageIntro>

      <section className="section">
        <div className="shell insight-grid">
          <div className="sticky-intro">
            <p className="eyebrow">Classification first</p>
            <h2>A vendor feature is not the same as municipal AI use.</h2>
            <p>
              The AI study was built as a candidate inventory. In the merged
              atlas, a record only receives the strongest label when published
              fields explicitly identify an AI mechanism. Everything else stays
              visible as a review queue rather than being promoted into a claim.
            </p>
            <Link className="text-link" href="/explore">
              Open the explorer with AI filters <Arrow />
            </Link>
          </div>
          <div className="contrast-panel">
            <p className="panel-kicker">AI-lens records by evidence label</p>
            <RatioBar
              value={summary.aiRoles["AI-primary or AI-dependent"]}
              max={summary.totals.aiTaggedRecords}
              label="AI-primary or AI-dependent"
              tone="blue"
            />
            <RatioBar
              value={summary.aiRoles["AI-assisted workflow"]}
              max={summary.totals.aiTaggedRecords}
              label="AI-assisted workflow"
              tone="lime"
            />
            <RatioBar
              value={summary.aiRoles["AI-capable; use unconfirmed"]}
              max={summary.totals.aiTaggedRecords}
              label="AI-capable; use unconfirmed"
              tone="orange"
            />
            <RatioBar
              value={summary.aiRoles["AI relevance needs review"]}
              max={summary.totals.aiTaggedRecords}
              label="AI relevance needs review"
              tone="orange"
            />
            <p className="chart-footnote">
              These labels are a first-pass research classification. They are
              not an audit of deployment, procurement, or policy compliance.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-tint-blue">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Where AI signals appear</p>
            <h2>The lens crosses every civic pillar.</h2>
            <p>
              AI is not a seventh pillar. It can shape resident service,
              internal work, public safety, infrastructure, or mobility. The
              distribution below counts AI-lens candidate records, including
              records still awaiting classification review.
            </p>
          </div>
          <div className="pillar-report-grid">
            {aiByPillar.map(([pillar, count]) => (
              <article key={pillar}>
                <span>{count}</span>
                <h3>{pillar}</h3>
                <p>{Math.round((count / aiRecords.length) * 100)}% of AI-lens candidates</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell split-callout">
          <div>
            <p className="eyebrow">Resident-facing visibility</p>
            <h2>Homepage GenAI remains uncommon in this sample.</h2>
          </div>
          <div>
            <p className="large-copy">
              The working AI study flagged {homepageJurisdictions.length} jurisdictions
              with a GenAI experience visible from the municipal homepage:
              {" "}{homepageJurisdictions.join(", ")}.
            </p>
            <p className="muted-copy">
              Homepage visibility is a narrow discovery measure. It does not
              capture every resident assistant or internal use case.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="shell ethics-grid">
          <div>
            <p className="eyebrow">Community review priorities</p>
            <h2>Move from product labels to evidence of use.</h2>
          </div>
          <div className="review-priorities">
            <ol>
              <li>Confirm the jurisdiction-specific AI function, not just vendor capability.</li>
              <li>Record lifecycle: operational, pilot, planned, retired, or unknown.</li>
              <li>Add governance, privacy, civil-rights, retention, and outcome sources.</li>
              <li>Separate municipal confirmation from vendor or secondary claims.</li>
            </ol>
            <Link className="text-link text-link-light" href="/contribute">
              Help review AI records <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
