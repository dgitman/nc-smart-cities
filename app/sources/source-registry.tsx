"use client";

import { useEffect, useMemo, useState } from "react";
import type { SourceRecord, SystemRecord } from "../data-model";
import { sourceDomainFromUrl } from "../data-model";

type PublicDataset = { records: SystemRecord[] };

type RegistryItem = SourceRecord & {
  recordCount: number;
  jurisdictions: string[];
  initiatives: string[];
  verificationLabels: string[];
};

const PAGE_SIZE = 60;

export function SourceRegistry() {
  const [records, setRecords] = useState<SystemRecord[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/data/smart-city-systems.json")
      .then((response) => {
        if (!response.ok) throw new Error("The source registry could not be loaded.");
        return response.json() as Promise<PublicDataset>;
      })
      .then((data) => setRecords(data.records))
      .catch((caught: Error) => setError(caught.message));
  }, []);

  const registry = useMemo(() => {
    const items = new Map<
      string,
      SourceRecord & {
        records: Set<string>;
        jurisdictions: Set<string>;
        initiatives: Set<string>;
        verificationLabels: Set<string>;
      }
    >();
    for (const record of records) {
      for (const source of record.sources) {
        const item = items.get(source.url) ?? {
          ...source,
          records: new Set<string>(),
          jurisdictions: new Set<string>(),
          initiatives: new Set<string>(),
          verificationLabels: new Set<string>(),
        };
        item.records.add(record.id);
        item.jurisdictions.add(record.jurisdiction);
        item.initiatives.add(record.initiative);
        item.verificationLabels.add(source.verificationStatus);
        items.set(source.url, item);
      }
    }
    return [...items.values()]
      .map<RegistryItem>((item) => ({
        url: item.url,
        domain: sourceDomainFromUrl(item.url),
        type: item.type,
        origin: item.origin,
        verificationStatus: item.verificationStatus,
        recordCount: item.records.size,
        jurisdictions: [...item.jurisdictions].sort(),
        initiatives: [...item.initiatives].sort(),
        verificationLabels: [...item.verificationLabels].sort(),
      }))
      .sort((a, b) => b.recordCount - a.recordCount || a.domain.localeCompare(b.domain));
  }, [records]);

  const types = useMemo(() => [...new Set(registry.map((item) => item.type))].sort(), [registry]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return registry.filter((item) => {
      if (type && item.type !== type) return false;
      if (
        needle &&
        ![
          item.domain,
          item.type,
          ...item.jurisdictions,
          ...item.initiatives,
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [registry, query, type]);

  return (
    <div className="source-registry">
      <div className="source-filters">
        <div>
          <label htmlFor="source-search">Search sources</label>
          <input
            id="source-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Domain, city, or initiative…"
          />
        </div>
        <div>
          <label htmlFor="source-type">Source type</label>
          <select
            id="source-type"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setVisible(PAGE_SIZE);
            }}
          >
            <option value="">All source types</option>
            {types.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <button
          className="reset-button"
          type="button"
          onClick={() => {
            setQuery("");
            setType("");
            setVisible(PAGE_SIZE);
          }}
        >
          Reset filters
        </button>
      </div>

      {error ? <p className="load-state load-error">{error}</p> : null}
      {!error ? (
        <>
          <div className="result-summary" aria-live="polite">
            <strong>{filtered.length.toLocaleString()}</strong> distinct public sources
          </div>
          <div className="source-table-wrap">
            <table className="source-table">
              <thead>
                <tr>
                  <th scope="col">Source</th>
                  <th scope="col">Type</th>
                  <th scope="col">Records</th>
                  <th scope="col">Jurisdictions</th>
                  <th scope="col">Working review label</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, visible).map((item) => (
                  <tr key={item.url}>
                    <th scope="row">
                      <a href={item.url} target="_blank" rel="noreferrer">
                        {item.domain} ↗
                      </a>
                      <small>{item.url}</small>
                    </th>
                    <td>{item.type}</td>
                    <td>{item.recordCount}</td>
                    <td>{item.jurisdictions.slice(0, 4).join(", ")}{item.jurisdictions.length > 4 ? ` +${item.jurisdictions.length - 4}` : ""}</td>
                    <td>{item.verificationLabels.join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visible < filtered.length ? (
            <div className="load-more-wrap">
              <button className="button button-secondary" type="button" onClick={() => setVisible(visible + PAGE_SIZE)}>
                Show {Math.min(PAGE_SIZE, filtered.length - visible)} more sources
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
