import { PageIntro, Stat } from "../components";
import { summary } from "../data";
import { Explorer } from "./explorer";

export const metadata = {
  title: "Explore the Atlas",
  description:
    "Search and filter source-linked municipal technology records across North Carolina.",
};

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
