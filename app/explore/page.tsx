import { PageIntro, Stat } from "../components";
import { cityPath, pillarPath, pillars, summary } from "../data";
import { createPageMetadata } from "../seo";
import { Explorer } from "./explorer";

export const metadata = createPageMetadata({
  title: "Explore the Atlas",
  description:
    "Search and filter source-linked municipal technology records across North Carolina.",
  path: "/explore",
});

export default function ExplorePage() {
  return (
    <main id="main-content">
      <PageIntro
        index="01"
        eyebrow="Unified public dataset"
        title="Explore systems with the evidence beside them."
        summary="Filter the merged dataset by place, civic pillar, lifecycle, and AI role. Every visible record includes at least one public source."
        tone="lime"
      >
        <Stat value={summary.totals.records.toLocaleString()} label="public records" />
        <Stat value={summary.totals.jurisdictions.toString()} label="jurisdictions" />
        <Stat value={summary.totals.publicSources.toLocaleString()} label="distinct sources" />
        <Stat value="Jul 2026" label="research snapshot" />
      </PageIntro>

      <section className="section section-compact browse-entry-points">
        <div className="shell browse-entry-grid">
          <div>
            <p className="eyebrow">Browse by place</p>
            <h2>Start with a North Carolina community.</h2>
            <p>Each place page collects its systems, evidence links, and civic-pillar mix.</p>
            <div className="compact-link-list">
              {["Cary", "Apex", "Raleigh", "Durham", "Asheville"].map((city) => (
                <a key={city} href={cityPath(city)}>{city}</a>
              ))}
              <a href="/cities">All 51 jurisdictions →</a>
            </div>
          </div>
          <div>
            <p className="eyebrow">Browse by theme</p>
            <h2>Follow a civic system across communities.</h2>
            <p>The six-pillar taxonomy makes related municipal technologies easier to compare.</p>
            <div className="compact-link-list">
              {pillars.map(([, title]) => (
                <a key={title} href={pillarPath(title)}>{title}</a>
              ))}
              <a href="/pillars">All civic pillars →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section explorer-section">
        <div className="shell">
          <div className="data-caveat">
            <strong>Read records as documented evidence—not verified outcomes.</strong>
            <p>
              “Marked verified” reflects the internship working data. It does
              not establish that a system remains active, effective, or endorsed.
            </p>
          </div>
          <Explorer />
        </div>
      </section>
    </main>
  );
}
