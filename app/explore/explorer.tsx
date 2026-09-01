"use client";

import { useEffect, useMemo, useState } from "react";
import type { SystemRecord } from "../data-model";
import {
  aiRoleLabels,
  cityPath,
  sourceDomainFromUrl,
  systemPath,
} from "../data-model";

type PublicDataset = {
  records: SystemRecord[];
};

const PAGE_SIZE = 36;

function searchable(record: SystemRecord) {
  return [
    record.jurisdiction,
    record.county,
    record.initiative,
    record.pillar,
    record.category,
    record.technology,
    record.department,
    record.vendor,
    record.product,
    ...record.sources.map((source) => sourceDomainFromUrl(source.url)),
  ]
    .join(" ")
    .toLowerCase();
}

export function Explorer() {
  const [records, setRecords] = useState<SystemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [pillar, setPillar] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [aiRole, setAiRole] = useState("");
  const [verification, setVerification] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/smart-city-systems.json")
      .then((response) => {
        if (!response.ok) throw new Error("The dataset could not be loaded.");
        return response.json() as Promise<PublicDataset>;
      })
      .then((data) => {
        if (!cancelled) setRecords(data.records);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const choices = useMemo(
    () => ({
      jurisdictions: [...new Set(records.map((record) => record.jurisdiction))].sort(),
      pillars: [...new Set(records.map((record) => record.pillar))].sort(),
      lifecycles: [...new Set(records.map((record) => record.lifecycleStatus))].sort(),
      aiRoles: [...new Set(records.map((record) => record.aiRole))].sort(),
    }),
    [records],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      if (needle && !searchable(record).includes(needle)) return false;
      if (jurisdiction && record.jurisdiction !== jurisdiction) return false;
      if (pillar && record.pillar !== pillar) return false;
      if (lifecycle && record.lifecycleStatus !== lifecycle) return false;
      if (aiRole === "any-ai" && record.aiRole === "No AI signal in published fields") return false;
      if (aiRole && aiRole !== "any-ai" && record.aiRole !== aiRole) return false;
      if (
        verification === "verified" &&
        !record.sources.some((source) => source.verificationStatus === "Marked verified in working data")
      ) {
        return false;
      }
      if (
        verification === "needs-review" &&
        !record.sources.some((source) => source.verificationStatus !== "Marked verified in working data")
      ) {
        return false;
      }
      return true;
    });
  }, [records, query, jurisdiction, pillar, lifecycle, aiRole, verification]);

  const reset = () => {
    setQuery("");
    setJurisdiction("");
    setPillar("");
    setLifecycle("");
    setAiRole("");
    setVerification("");
    setVisible(PAGE_SIZE);
  };

  const update = (setter: (value: string) => void, value: string) => {
    setter(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="explorer">
      <form className="filter-panel" onSubmit={(event) => event.preventDefault()}>
        <div className="filter-search">
          <label htmlFor="system-search">Search records</label>
          <input
            id="system-search"
            type="search"
            value={query}
            onChange={(event) => update(setQuery, event.target.value)}
            placeholder="Initiative, vendor, city, source…"
          />
        </div>
        <div>
          <label htmlFor="jurisdiction-filter">Jurisdiction</label>
          <select
            id="jurisdiction-filter"
            value={jurisdiction}
            onChange={(event) => update(setJurisdiction, event.target.value)}
          >
            <option value="">All jurisdictions</option>
            {choices.jurisdictions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pillar-filter">Pillar</label>
          <select id="pillar-filter" value={pillar} onChange={(event) => update(setPillar, event.target.value)}>
            <option value="">All pillars</option>
            {choices.pillars.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lifecycle-filter">Lifecycle</label>
          <select
            id="lifecycle-filter"
            value={lifecycle}
            onChange={(event) => update(setLifecycle, event.target.value)}
          >
            <option value="">All lifecycle states</option>
            {choices.lifecycles.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ai-filter">AI role</label>
          <select id="ai-filter" value={aiRole} onChange={(event) => update(setAiRole, event.target.value)}>
            <option value="">All records</option>
            <option value="any-ai">Any AI-lens candidate</option>
            {choices.aiRoles
              .filter((value) => value !== "No AI signal in published fields")
              .map((value) => (
                <option key={value} value={value}>
                  {aiRoleLabels[value] ?? value}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor="verification-filter">Source review</label>
          <select
            id="verification-filter"
            value={verification}
            onChange={(event) => update(setVerification, event.target.value)}
          >
            <option value="">All review labels</option>
            <option value="verified">Has a source marked verified</option>
            <option value="needs-review">Has a source needing review</option>
          </select>
        </div>
        <button className="reset-button" type="button" onClick={reset}>
          Reset filters
        </button>
      </form>

      {loading ? <p className="load-state">Loading public records…</p> : null}
      {loadError ? <p className="load-state load-error">{loadError}</p> : null}

      {!loading && !loadError ? (
        <>
          <div className="result-summary" aria-live="polite">
            <strong>{filtered.length.toLocaleString()}</strong> records match
            <span> · showing {Math.min(filtered.length, visible).toLocaleString()}</span>
          </div>

          <div className="record-grid">
            {filtered.slice(0, visible).map((record) => (
              <article className="record-card" key={record.id}>
                <div className="record-topline">
                  <a href={cityPath(record.jurisdiction)}>{record.jurisdiction}</a>
                  <span>{record.lifecycleStatus}</span>
                </div>
                <h2><a href={systemPath(record)}>{record.initiative}</a></h2>
                <p className="record-technology">{record.technology}</p>
                <ul className="record-tags" aria-label="Record classifications">
                  <li>{record.pillar}</li>
                  <li>{record.audience}</li>
                  {record.aiRole !== "No AI signal in published fields" ? (
                    <li className="tag-ai">{aiRoleLabels[record.aiRole] ?? record.aiRole}</li>
                  ) : null}
                </ul>
                <dl className="record-details">
                  <div>
                    <dt>Department / category</dt>
                    <dd>{record.department || record.category}</dd>
                  </div>
                  {record.vendor || record.product ? (
                    <div>
                      <dt>Vendor / product</dt>
                      <dd>{[record.vendor, record.product].filter(Boolean).join(" · ")}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Dataset origin</dt>
                    <dd>{record.origins.join(" + ")}</dd>
                  </div>
                </dl>
                <div className="source-block">
                  <span className="source-heading">Public evidence</span>
                  {record.sources.map((source, index) => (
                    <div className="source-line" key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open source ${index + 1} for ${record.initiative} in ${record.jurisdiction}`}
                      >
                        {sourceDomainFromUrl(source.url)} ↗
                      </a>
                      <span>{source.type}</span>
                      <small>{source.verificationStatus}</small>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {visible < filtered.length ? (
            <div className="load-more-wrap">
              <button className="button button-secondary" type="button" onClick={() => setVisible(visible + PAGE_SIZE)}>
                Show {Math.min(PAGE_SIZE, filtered.length - visible)} more records
              </button>
            </div>
          ) : null}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <h2>No records match those filters.</h2>
              <p>Try removing a filter, or propose a missing system through the contribution guide.</p>
              <button className="button button-secondary" type="button" onClick={reset}>
                Clear filters
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
