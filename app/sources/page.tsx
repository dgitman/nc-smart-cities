import { PageIntro, Stat } from "../components";
import { summary } from "../data";
import { SourceRegistry } from "./source-registry";

export const metadata = {
  title: "Source Registry",
  description:
    "Browse the public evidence behind records in the NC Smart-City Systems Atlas.",
};

export default function SourcesPage() {
  return (
    <main id="main-content">
      <PageIntro
        index="03"
        eyebrow="Provenance layer"
        title="The source is part of the record."
        summary="Browse the public links supporting the atlas, see how many records each source supports, and inspect the working verification label."
        tone="lime"
      >
        <Stat value={summary.totals.publicSources.toLocaleString()} label="distinct public URLs" />
        <Stat value={summary.totals.sourceDomains.toLocaleString()} label="source domains" />
        <Stat value={summary.totals.records.toLocaleString()} label="linked records" />
        <Stat value="0" label="internal URLs published" />
      </PageIntro>

      <section className="section source-registry-section">
        <div className="shell">
          <div className="data-caveat">
            <strong>A source link is provenance, not proof of performance.</strong>
            <p>
              Vendor pages, news coverage, municipal pages, and working
              verification labels carry different evidentiary weight. Open the
              linked page and evaluate the underlying claim.
            </p>
          </div>
          <SourceRegistry />
        </div>
      </section>
    </main>
  );
}
