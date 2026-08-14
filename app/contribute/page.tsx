import Link from "next/link";
import { Arrow, PageIntro, Stat } from "../components";
import { summary } from "../data";

export const metadata = {
  title: "Contribute",
  description:
    "How to propose additions, corrections, evidence updates, and AI classifications for the NC Smart-City Systems Atlas.",
};

const reviewStates = [
  ["01", "Proposed", "A contributor supplies a structured record and direct public evidence."],
  ["02", "Source checked", "A reviewer confirms the link is public and supports the stated jurisdiction and system."],
  ["03", "Classified", "Pillar, lifecycle, audience, and AI role are reviewed conservatively."],
  ["04", "Published", "The record enters a dated release with provenance and a changelog entry."],
];

export default function ContributePage() {
  return (
    <main id="main-content">
      <PageIntro
        index="04"
        eyebrow="Community project"
        title="Make the atlas more accurate, not merely larger."
        summary="Propose a missing system, correct a record, replace a weak source, clarify lifecycle, or review an AI classification. Public evidence and privacy safety are required."
        tone="blue"
      >
        <Stat value={summary.version} label="dataset version" />
        <Stat value="4" label="review states" />
        <Stat value="1" label="public source minimum" />
        <Stat value="0" label="private links accepted" />
      </PageIntro>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Contribution workflow</p>
            <h2>Small, source-backed changes are the unit of progress.</h2>
            <p>
              The review model is designed for a future public repository. This
              local prototype includes the governance files and templates now;
              issue and pull-request intake can be activated when publication
              rights and hosting are approved.
            </p>
          </div>
          <ol className="contribution-steps">
            {reviewStates.map(([number, title, description]) => (
              <li key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tint-lime">
        <div className="shell download-grid">
          <div>
            <p className="eyebrow">Open project materials</p>
            <h2>Use the format that fits your contribution.</h2>
            <p>
              The CSV is suited to code and bulk review. The workbook includes
              a README, records, an AI-lens sheet, a data dictionary, and a
              validated contribution sheet. JSON powers the site directly.
            </p>
          </div>
          <div className="download-list">
            <a href="/data/contribution-template.csv" download>
              <span>CSV</span>
              <strong>Blank contribution template</strong>
              <small>One proposed system per row</small>
            </a>
            <a href="/data/nc-smart-city-systems-community-dataset.xlsx" download>
              <span>XLSX</span>
              <strong>Community dataset workbook</strong>
              <small>Records, AI lens, dictionary, contribution sheet</small>
            </a>
            <a href="/data/smart-city-systems.csv" download>
              <span>CSV</span>
              <strong>Sanitized public dataset</strong>
              <small>{summary.totals.records.toLocaleString()} source-linked records</small>
            </a>
            <a href="/data/smart-city-systems.json" download>
              <span>JSON</span>
              <strong>Site-ready public data</strong>
              <small>Metadata, records, and nested sources</small>
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell boundary-grid">
          <div>
            <p className="eyebrow">What a good proposal includes</p>
            <h2>Specific claim. Direct evidence. Conservative classification.</h2>
          </div>
          <div className="checklist-grid">
            <article>
              <h3>Required</h3>
              <ul>
                <li>Official jurisdiction name and North Carolina county</li>
                <li>One clearly named system or initiative</li>
                <li>A direct, public, non-login source URL</li>
                <li>A short statement of what the source supports</li>
              </ul>
            </article>
            <article>
              <h3>Helpful</h3>
              <ul>
                <li>Lifecycle and the source language supporting it</li>
                <li>Department, audience, vendor, and product</li>
                <li>Publication or verification date</li>
                <li>Privacy, civil-rights, governance, or outcome evidence</li>
              </ul>
            </article>
            <article>
              <h3>Never submit</h3>
              <ul>
                <li>Internal Town, SharePoint, Drive, email, or login links</li>
                <li>Names, phone numbers, staff email addresses, or credentials</li>
                <li>Nonpublic security, infrastructure, pricing, or access details</li>
                <li>Raw notes copied from a private work environment</li>
              </ul>
            </article>
            <article>
              <h3>AI-specific caution</h3>
              <ul>
                <li>Show the actual AI function, not just platform capability</li>
                <li>Separate active use, claim, capability, and uncertainty</li>
                <li>Do not infer AI from analytics, cameras, or “smart” branding</li>
                <li>Include governance or impact evidence when available</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="shell split-callout">
          <div>
            <p className="eyebrow">Project governance</p>
            <h2>The rules are part of the deliverable.</h2>
          </div>
          <div>
            <p className="large-copy">
              Review the contribution guide, data dictionary, governance model,
              code of conduct, and security policy before proposing a change.
            </p>
            <div className="document-links">
              <a href="/community/CONTRIBUTING.md">Contributing guide <Arrow /></a>
              <a href="/community/DATA_DICTIONARY.md">Data dictionary <Arrow /></a>
              <a href="/community/GOVERNANCE.md">Governance <Arrow /></a>
              <a href="/community/CODE_OF_CONDUCT.md">Code of conduct <Arrow /></a>
              <a href="/community/SECURITY.md">Security policy <Arrow /></a>
            </div>
            <Link className="text-link text-link-light" href="/methodology">
              Review the full methodology <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
