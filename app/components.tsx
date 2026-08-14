import { NavLinks } from "./nav-links";

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function ProjectCard({
  number,
  title,
  description,
  metrics,
  finding,
  href,
  tone,
}: {
  number: string;
  title: string;
  description: string;
  metrics: string[];
  finding: string;
  href: string;
  tone: "blue" | "lime";
}) {
  return (
    <article className={`project-card project-${tone} reveal`}>
      <div className="project-index">{number}</div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ul className="metric-list" aria-label="Project scope">
        {metrics.map((metric) => (
          <li key={metric}>{metric}</li>
        ))}
      </ul>
      <div className="finding">
        <span>Core finding</span>
        <p>{finding}</p>
      </div>
      <a href={href} className="card-link" aria-label={`Explore ${title}`}>
        Explore the study <Arrow />
      </a>
    </article>
  );
}

export function MethodFlow() {
  const steps = [
    ["01", "Collect", "Public evidence and municipal records"],
    ["02", "Structure", "Comparable fields, sources, and status"],
    ["03", "Classify", "Shared taxonomy and audience lens"],
    ["04", "Compare", "Peer patterns, gaps, and maturity"],
    ["05", "Recommend", "Impact, cost, risk, staff, resident"],
  ];

  return (
    <ol className="method-flow">
      {steps.map(([number, title, text]) => (
        <li key={number}>
          <span className="method-number">{number}</span>
          <div>
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="prototype-banner">
        <span>Community-preview prototype</span>
        <span aria-hidden="true">·</span>
        <span>Not approved for public release</span>
      </div>
      <header className="site-header">
        <div className="shell nav-wrap">
          <a className="wordmark" href="/" aria-label="NC Smart-City Systems Atlas home">
            <span className="wordmark-mark" aria-hidden="true">NC</span>
            <span>
              Smart-City Systems Atlas
              <small>North Carolina · Community data</small>
            </span>
          </a>
          <NavLinks />
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="footer-title">NC Smart-City Systems Atlas</p>
          <p>Initiated by David Gitman from 2026 municipal internship research.</p>
          <p>Independent community-project prototype—not an official Town of Apex, Wake Tech, or municipal publication.</p>
        </div>
        <div>
          <p>
            Research snapshot: July 2026. Every published record carries a
            public source; evidence is not proof of current operation or value.
          </p>
        </div>
        <div className="footer-links">
          <a href="/explore">Explore records</a>
          <a href="/sources">Source registry</a>
          <a href="/methodology">Method & limitations</a>
          <a href="/contribute">Contribute</a>
        </div>
      </div>
    </footer>
  );
}

export function RatioBar({
  value,
  max,
  label,
  note,
  tone = "blue",
}: {
  value: number;
  max: number;
  label: string;
  note?: string;
  tone?: "blue" | "lime" | "orange";
}) {
  const width = `${Math.max((value / max) * 100, 2)}%`;
  return (
    <div className="ratio-row">
      <div className="ratio-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="ratio-track" aria-hidden="true">
        <div className={`ratio-fill ratio-${tone}`} style={{ width }} />
      </div>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

export function PageIntro({
  index,
  eyebrow,
  title,
  summary,
  children,
  tone,
}: {
  index: string;
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
  tone: "blue" | "lime";
}) {
  return (
    <section className={`page-hero page-hero-${tone}`}>
      <div className="shell page-hero-grid">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{summary}</p>
        </div>
        <div className="page-index" aria-hidden="true">{index}</div>
      </div>
      <div className="shell page-stats">{children}</div>
    </section>
  );
}

export function Pill({ children }: { children: React.ReactNode }) {
  return <span className="pill">{children}</span>;
}
