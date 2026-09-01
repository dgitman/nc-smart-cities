import type { SystemRecord } from "./data-model";
import {
  aiRoleLabels,
  cityPath,
  pillarPath,
  systemPath,
} from "./data-model";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item) => (
          <li key={`${item.href ?? "current"}-${item.label}`}>
            {item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function RecordCards({ records }: { records: SystemRecord[] }) {
  return (
    <div className="seo-record-grid">
      {records.map((record) => (
        <article className="seo-record-card" key={record.id}>
          <div className="record-topline">
            <a href={cityPath(record.jurisdiction)}>{record.jurisdiction}</a>
            <span>{record.lifecycleStatus}</span>
          </div>
          <h2><a href={systemPath(record)}>{record.initiative}</a></h2>
          <p>{record.technology}</p>
          <ul className="record-tags" aria-label="Record classifications">
            <li><a href={pillarPath(record.pillar)}>{record.pillar}</a></li>
            <li>{record.audience}</li>
            {record.aiRole !== "No AI signal in published fields" ? (
              <li className="tag-ai">{aiRoleLabels[record.aiRole] ?? record.aiRole}</li>
            ) : null}
          </ul>
          <p className="record-evidence-count">
            {record.sources.length} public {record.sources.length === 1 ? "source" : "sources"}
          </p>
        </article>
      ))}
    </div>
  );
}
