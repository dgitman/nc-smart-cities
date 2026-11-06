import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

export const LIMITS = Object.freeze({
  jsonBytes: 5 * 1024 * 1024,
  csvBytes: 5 * 1024 * 1024,
  xlsxBytes: 10 * 1024 * 1024,
  xlsxEntryBytes: 20 * 1024 * 1024,
  xlsxExpandedBytes: 40 * 1024 * 1024,
  xlsxEntries: 2_000,
  records: 5_000,
  sourcesPerRecord: 20,
  originsPerRecord: 8,
  nestingDepth: 12,
  stringLength: 20_000,
  objectKeys: 64,
});

const JSON_URL = new URL("../public/data/smart-city-systems.json", import.meta.url);
const CSV_URL = new URL("../public/data/smart-city-systems.csv", import.meta.url);
const XLSX_URL = new URL(
  "../public/data/nc-smart-city-systems-community-dataset.xlsx",
  import.meta.url,
);

const TOP_LEVEL_KEYS = new Set(["metadata", "records"]);
const METADATA_KEYS = new Set([
  "version",
  "snapshotDate",
  "generatedDate",
  "title",
  "description",
  "totals",
  "pillars",
  "aiRoles",
  "quality",
  "scopeNote",
  "publicationNote",
]);
const TOTAL_KEYS = new Set([
  "records",
  "jurisdictions",
  "counties",
  "publicSources",
  "sourceDomains",
  "aiTaggedRecords",
  "aiTaggedJurisdictions",
  "genAiHomepageJurisdictions",
]);
const QUALITY_KEYS = new Set([
  "sourceRequiredForPublication",
  "recordsExcludedWithoutSafePublicSource",
  "exactDuplicatesCollapsed",
  "aiRowsMergedIntoSmartCity",
  "aiPlaceholderRowsExcluded",
  "verificationReminder",
]);
const RECORD_KEYS = new Set([
  "id",
  "jurisdiction",
  "county",
  "population",
  "populationYear",
  "initiative",
  "pillar",
  "category",
  "technology",
  "department",
  "audience",
  "vendor",
  "product",
  "lifecycleStatus",
  "aiRole",
  "publicNote",
  "genAiOnHomepage",
  "origins",
  "sources",
]);
const SOURCE_KEYS = new Set(["url", "domain", "type", "verificationStatus", "origin"]);
const REQUIRED_RECORD_KEYS = new Set([...RECORD_KEYS].filter((key) => key !== "genAiOnHomepage"));

const RECORD_STRING_FIELDS = [
  "id",
  "jurisdiction",
  "county",
  "initiative",
  "pillar",
  "category",
  "technology",
  "department",
  "audience",
  "vendor",
  "product",
  "lifecycleStatus",
  "aiRole",
  "publicNote",
];

const CSV_HEADER = [
  "record_id",
  "jurisdiction",
  "county",
  "population",
  "population_year",
  "initiative",
  "pillar",
  "category",
  "technology",
  "department",
  "audience",
  "vendor",
  "product",
  "lifecycle_status",
  "ai_role",
  "genai_on_homepage",
  "public_note",
  "dataset_origin",
  "source_url",
  "source_domain",
  "source_type",
  "source_verification",
  "additional_source_urls",
];

const DENIED_HOST_SUFFIXES = [
  "sharepoint.com",
  "sharepoint.us",
  "sharepoint.de",
  "sharepoint.cn",
  "onedrive.live.com",
  "drive.google.com",
  "docs.google.com",
  "mail.google.com",
  "teams.microsoft.com",
  "login.microsoftonline.com",
  "login.microsoft.com",
  "login.live.com",
  "accounts.google.com",
  "myaccount.microsoft.com",
  "portal.azure.com",
  "admin.microsoft.com",
  "signin.aws.amazon.com",
  "okta.com",
  "oktapreview.com",
  "auth0.com",
];
const DENIED_HOST_LABELS = new Set([
  "admin",
  "auth",
  "employee",
  "idp",
  "intranet",
  "login",
  "signin",
  "sso",
  "staff",
  "vpn",
  "webmail",
]);
const DENIED_HOST_ENDINGS = [".local", ".internal", ".intranet"];
const DENIED_PATH = /(?:^|\/)(?:_layouts|admin(?:istrator)?|auth|login|oauth2?|personal|private|sign-?in|sso)(?:\/|$)/i;

const SECRET_QUERY_KEYS = new Set([
  "accesskey",
  "accesstoken",
  "apikey",
  "authkey",
  "authorization",
  "authtoken",
  "clientsecret",
  "code",
  "credential",
  "credentials",
  "jwt",
  "key",
  "password",
  "passwd",
  "sas",
  "secret",
  "session",
  "sessionid",
  "sig",
  "signature",
  "ticket",
  "token",
]);

const FORBIDDEN_CONTENT = [
  [/\/Users\//i, "private filesystem path"],
  [/CloudStorage/i, "private cloud-storage path"],
  [/software budget/i, "private budget marker"],
  [/access card/i, "private access marker"],
  [/credential number/i, "credential marker"],
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, "email address"],
  [/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/, "phone number"],
  [
    /(?:^|[\s"'`{[(,;])(?:access[-_\s]?token|api[-_\s]?key|auth[-_\s]?(?:key|token)|client[-_\s]?secret|credential(?:[-_\s]?(?:id|number))?|password|passwd|private[-_\s]?key|secret)\s*[:=]\s*\S/i,
    "credential assignment",
  ],
  [/-----BEGIN (?:EC |OPENSSH |PGP |RSA )?PRIVATE KEY-----/i, "private key"],
  [/\bBearer\s+[A-Z0-9._~+/-]{12,}={0,2}\b/i, "bearer credential"],
  [/\bAKIA[A-Z0-9]{16}\b/, "AWS access key"],
  [/\bgh[pousr]_[A-Z0-9]{30,}\b/i, "GitHub credential"],
];

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function decodeXmlEntities(value) {
  return value
    .replace(/_x([0-9a-f]{4})_/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function normalizedVariants(value) {
  const variants = new Set([value.normalize("NFKC")]);
  for (let pass = 0; pass < 2; pass += 1) {
    for (const candidate of [...variants]) {
      const xmlDecoded = decodeXmlEntities(candidate).normalize("NFKC");
      variants.add(xmlDecoded);
      try {
        variants.add(decodeURIComponent(candidate).normalize("NFKC"));
      } catch {
        // A literal percent sign is valid public text; malformed encoding is not decoded.
      }
    }
  }
  return [...variants];
}

function assertNoForbiddenContent(value, context) {
  for (const candidate of normalizedVariants(value)) {
    for (const [pattern, label] of FORBIDDEN_CONTENT) {
      ensure(!pattern.test(candidate), `${context} contains forbidden ${label}.`);
    }
  }
}

export function assertSafeString(value, context = "Public data string") {
  ensure(typeof value === "string", `${context} must be a string.`);
  ensure(value.length <= LIMITS.stringLength, `${context} exceeds the length limit.`);
  const hasForbiddenControl = [...value].some((character) => {
    const codePoint = character.codePointAt(0);
    return (
      codePoint <= 8 ||
      codePoint === 11 ||
      codePoint === 12 ||
      (codePoint >= 14 && codePoint <= 31) ||
      codePoint === 127
    );
  });
  ensure(!hasForbiddenControl, `${context} contains control characters.`);
  assertNoForbiddenContent(value, context);
}

function validateValueTree(value, depth = 0) {
  ensure(depth <= LIMITS.nestingDepth, "Public JSON exceeds the nesting-depth limit.");

  if (typeof value === "string") {
    assertSafeString(value);
    return;
  }
  if (value === null || typeof value === "boolean") return;
  if (typeof value === "number") {
    ensure(Number.isFinite(value), "Public JSON contains a non-finite number.");
    return;
  }
  if (Array.isArray(value)) {
    ensure(value.length <= LIMITS.records, "Public JSON contains an oversized array.");
    for (const item of value) validateValueTree(item, depth + 1);
    return;
  }

  ensure(isPlainObject(value), "Public JSON contains an unsupported value type.");
  const keys = Object.keys(value);
  ensure(keys.length <= LIMITS.objectKeys, "Public JSON object has too many properties.");
  for (const key of keys) {
    assertSafeString(key, "Public JSON property name");
    validateValueTree(value[key], depth + 1);
  }
}

function ensureOnlyKeys(value, allowed, context) {
  ensure(isPlainObject(value), `${context} must be an object.`);
  ensure(Object.keys(value).every((key) => allowed.has(key)), `${context} has an unsupported property.`);
}

function ensureNonNegativeInteger(value, context) {
  ensure(Number.isSafeInteger(value) && value >= 0, `${context} must be a non-negative integer.`);
}

function compactQueryKey(value) {
  return value.normalize("NFKC").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSecretQueryKey(value) {
  const key = compactQueryKey(value);
  if (SECRET_QUERY_KEYS.has(key)) return true;
  return (
    key.startsWith("xamz") ||
    /(?:accesstoken|apikey|authkey|authtoken|clientsecret|credential|password|passwd|privatekey|secret|sessionid|signature|ticket|token)$/.test(
      key,
    )
  );
}

function parseIpv4(hostname) {
  const parts = hostname.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return null;
  const bytes = parts.map(Number);
  return bytes.every((byte) => byte >= 0 && byte <= 255) ? bytes : null;
}

function isRestrictedIpv4(bytes) {
  const [a, b] = bytes;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function parseIpv6(hostname) {
  let address = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!address.includes(":")) return null;
  ensure(!address.includes("%"), "Source URL cannot contain an IPv6 zone identifier.");

  if (address.includes(".")) {
    const lastColon = address.lastIndexOf(":");
    const ipv4 = parseIpv4(address.slice(lastColon + 1));
    if (!ipv4) return null;
    address = `${address.slice(0, lastColon)}:${((ipv4[0] << 8) | ipv4[1]).toString(16)}:${(
      (ipv4[2] << 8) |
      ipv4[3]
    ).toString(16)}`;
  }

  const halves = address.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  if ([...left, ...right].some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return null;
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) return null;
  return [...left, ...Array(missing).fill("0"), ...right].map((part) => Number.parseInt(part, 16));
}

function isRestrictedIpv6(words) {
  const allZero = words.every((word) => word === 0);
  const loopback = words.slice(0, 7).every((word) => word === 0) && words[7] === 1;
  const ipv4Mapped = words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff;
  const ipv4Compatible = words.slice(0, 6).every((word) => word === 0);
  if (ipv4Mapped || ipv4Compatible) {
    const bytes = [words[6] >> 8, words[6] & 0xff, words[7] >> 8, words[7] & 0xff];
    if (isRestrictedIpv4(bytes)) return true;
  }
  return (
    allZero ||
    loopback ||
    (words[0] & 0xfe00) === 0xfc00 ||
    (words[0] & 0xffc0) === 0xfe80 ||
    (words[0] & 0xffc0) === 0xfec0 ||
    (words[0] & 0xff00) === 0xff00 ||
    (words[0] === 0x2001 && words[1] === 0x0db8)
  );
}

function canonicalHostname(hostname) {
  return hostname.toLowerCase().replace(/\.+$/u, "");
}

function canonicalDisplayHostname(hostname) {
  return canonicalHostname(hostname).replace(/^www\./u, "");
}

function parseClaimedDomain(value) {
  assertSafeString(value, "Source domain");
  let parsed;
  try {
    parsed = new URL(`http://${value}`);
  } catch {
    throw new Error("Source domain must be a valid hostname.");
  }
  ensure(
    !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      parsed.pathname === "/" &&
      !parsed.search &&
      !parsed.hash,
    "Source domain must contain only a hostname.",
  );
  return canonicalDisplayHostname(parsed.hostname);
}

export function validatePublicUrl(value, claimedDomain) {
  assertSafeString(value, "Source URL");
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Source URL must be a valid absolute URL.");
  }

  ensure(url.protocol === "http:" || url.protocol === "https:", "Source URL must use HTTP or HTTPS.");
  ensure(!url.username && !url.password, "Source URL user information is forbidden.");

  const hostname = canonicalHostname(url.hostname);
  ensure(hostname.length > 0, "Source URL must include a hostname.");
  ensure(hostname !== "localhost" && !hostname.endsWith(".localhost"), "Local source host is forbidden.");
  ensure(!DENIED_HOST_ENDINGS.some((ending) => hostname.endsWith(ending)), "Internal source host is forbidden.");
  ensure(
    !DENIED_HOST_SUFFIXES.some((denied) => hostname === denied || hostname.endsWith(`.${denied}`)),
    "Collaboration or login source host is forbidden.",
  );
  ensure(
    !hostname.split(".").some((label) => DENIED_HOST_LABELS.has(label)),
    "Administrative or login source host is forbidden.",
  );

  const ipv4 = parseIpv4(hostname);
  ensure(!ipv4 || !isRestrictedIpv4(ipv4), "Private, local, or reserved source address is forbidden.");
  const ipv6 = parseIpv6(hostname);
  ensure(!ipv6 || !isRestrictedIpv6(ipv6), "Private, local, or reserved source address is forbidden.");

  ensure(
    !normalizedVariants(url.pathname).some((candidate) => DENIED_PATH.test(candidate)),
    "Private, personal, administrative, or login source path is forbidden.",
  );
  ensure(
    ![...url.searchParams.keys()].some(isSecretQueryKey),
    "Secret-like source query parameters are forbidden.",
  );

  if (claimedDomain !== undefined) {
    ensure(
      parseClaimedDomain(claimedDomain) === canonicalDisplayHostname(hostname),
      "Source domain must match the canonical URL hostname.",
    );
  }
  return url;
}

function validateMetadata(metadata, records) {
  ensureOnlyKeys(metadata, METADATA_KEYS, "Dataset metadata");
  for (const field of [
    "version",
    "snapshotDate",
    "generatedDate",
    "title",
    "description",
    "scopeNote",
    "publicationNote",
  ]) {
    assertSafeString(metadata[field], `Metadata ${field}`);
  }

  ensureOnlyKeys(metadata.totals, TOTAL_KEYS, "Dataset totals");
  ensure(Object.keys(metadata.totals).length === TOTAL_KEYS.size, "Dataset totals are incomplete.");
  for (const value of Object.values(metadata.totals)) ensureNonNegativeInteger(value, "Dataset total");

  ensure(isPlainObject(metadata.pillars), "Dataset pillar totals must be an object.");
  ensure(isPlainObject(metadata.aiRoles), "Dataset AI-role totals must be an object.");
  for (const [label, value] of [...Object.entries(metadata.pillars), ...Object.entries(metadata.aiRoles)]) {
    assertSafeString(label, "Dataset classification label");
    ensureNonNegativeInteger(value, "Dataset classification total");
  }

  ensureOnlyKeys(metadata.quality, QUALITY_KEYS, "Dataset quality metadata");
  ensure(Object.keys(metadata.quality).length === QUALITY_KEYS.size, "Dataset quality metadata is incomplete.");
  ensure(metadata.quality.sourceRequiredForPublication === true, "Dataset must require a public source.");
  for (const field of [
    "recordsExcludedWithoutSafePublicSource",
    "exactDuplicatesCollapsed",
    "aiRowsMergedIntoSmartCity",
    "aiPlaceholderRowsExcluded",
  ]) {
    ensureNonNegativeInteger(metadata.quality[field], "Dataset quality total");
  }
  assertSafeString(metadata.quality.verificationReminder, "Dataset verification reminder");

  ensure(metadata.totals.records === records.length, "Metadata record total must match records.");
  ensure(
    metadata.totals.jurisdictions === new Set(records.map((record) => record.jurisdiction)).size,
    "Metadata jurisdiction total must match records.",
  );
}

export function validateDataset(data) {
  validateValueTree(data);
  ensureOnlyKeys(data, TOP_LEVEL_KEYS, "Public dataset");
  ensure(Object.keys(data).length === TOP_LEVEL_KEYS.size, "Public dataset must contain metadata and records.");
  ensure(Array.isArray(data.records), "Dataset records must be an array.");
  ensure(data.records.length > 0 && data.records.length <= LIMITS.records, "Dataset record count is out of bounds.");

  const recordIds = new Set();
  const sourceUrls = new Set();
  const sourceDomains = new Set();
  for (const [recordIndex, record] of data.records.entries()) {
    ensureOnlyKeys(record, RECORD_KEYS, `Record ${recordIndex}`);
    ensure(
      [...REQUIRED_RECORD_KEYS].every((key) => Object.hasOwn(record, key)),
      `Record ${recordIndex} is incomplete.`,
    );
    for (const field of RECORD_STRING_FIELDS) assertSafeString(record[field], `Record ${recordIndex} field`);
    ensure(/^ncs-[a-f0-9]{12}$/u.test(record.id), `Record ${recordIndex} has an invalid ID.`);
    ensure(record.jurisdiction.trim() && record.initiative.trim(), `Record ${recordIndex} is missing a core field.`);
    ensure(!recordIds.has(record.id), `Record ${recordIndex} has a duplicate ID.`);
    recordIds.add(record.id);

    for (const [value, label] of [
      [record.population, "population"],
      [record.populationYear, "population year"],
    ]) {
      ensure(value === null || (Number.isSafeInteger(value) && value >= 0), `Record ${recordIndex} has an invalid ${label}.`);
    }
    ensure(
      record.genAiOnHomepage === undefined || typeof record.genAiOnHomepage === "boolean",
      `Record ${recordIndex} has an invalid homepage flag.`,
    );
    ensure(
      Array.isArray(record.origins) &&
        record.origins.length > 0 &&
        record.origins.length <= LIMITS.originsPerRecord,
      `Record ${recordIndex} has an invalid origins list.`,
    );
    for (const origin of record.origins) assertSafeString(origin, `Record ${recordIndex} origin`);

    ensure(
      Array.isArray(record.sources) &&
        record.sources.length > 0 &&
        record.sources.length <= LIMITS.sourcesPerRecord,
      `Record ${recordIndex} has an invalid sources list.`,
    );
    for (const [sourceIndex, source] of record.sources.entries()) {
      ensureOnlyKeys(source, SOURCE_KEYS, `Record ${recordIndex} source ${sourceIndex}`);
      ensure(Object.keys(source).length === SOURCE_KEYS.size, `Record ${recordIndex} source ${sourceIndex} is incomplete.`);
      for (const field of SOURCE_KEYS) assertSafeString(source[field], `Record ${recordIndex} source ${sourceIndex} field`);
      validatePublicUrl(source.url, source.domain);
      sourceUrls.add(source.url);
      sourceDomains.add(canonicalDisplayHostname(new URL(source.url).hostname));
    }
  }

  validateMetadata(data.metadata, data.records);
  ensure(data.metadata.totals.publicSources === sourceUrls.size, "Metadata public-source total must match records.");
  ensure(data.metadata.totals.sourceDomains === sourceDomains.size, "Metadata source-domain total must match records.");
  return data;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let atFieldStart = true;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (inQuotes) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        inQuotes = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      ensure(atFieldStart, "CSV contains a quote in an unquoted field.");
      inQuotes = true;
      atFieldStart = false;
    } else if (character === ",") {
      row.push(field);
      field = "";
      atFieldStart = true;
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      atFieldStart = true;
    } else {
      field += character;
      atFieldStart = false;
    }
  }

  ensure(!inQuotes, "CSV contains an unterminated quoted field.");
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function assertSafeSpreadsheetCell(value, context = "Spreadsheet cell") {
  assertSafeString(value, context);
  const normalized = value.normalize("NFKC");
  ensure(!/^[\t\r\n]/u.test(normalized), `${context} begins with a spreadsheet control character.`);
  ensure(!/^\s*[=+@-]/u.test(normalized), `${context} begins with a spreadsheet formula marker.`);
}

function expectedCsvRow(record) {
  const firstSource = record.sources[0];
  return [
    record.id,
    record.jurisdiction,
    record.county,
    record.population === null ? "" : String(record.population),
    record.populationYear === null ? "" : String(record.populationYear),
    record.initiative,
    record.pillar,
    record.category,
    record.technology,
    record.department,
    record.audience,
    record.vendor,
    record.product,
    record.lifecycleStatus,
    record.aiRole,
    record.genAiOnHomepage ? "Yes" : "No",
    record.publicNote,
    record.origins.join(" + "),
    firstSource.url,
    firstSource.domain,
    firstSource.type,
    firstSource.verificationStatus,
    record.sources.slice(1).map((source) => source.url).join(" | "),
  ];
}

export function validateCsvText(text, data) {
  ensure(typeof text === "string", "Public CSV must be text.");
  const rows = parseCsv(text.replace(/^\uFEFF/u, ""));
  ensure(rows.length === data.records.length + 1, "CSV row count must match public JSON.");
  ensure(
    rows[0].length === CSV_HEADER.length && rows[0].every((cell, index) => cell === CSV_HEADER[index]),
    "CSV header does not match the public schema.",
  );

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    ensure(row.length === CSV_HEADER.length, `CSV row ${rowIndex} has an invalid column count.`);
    const expected = expectedCsvRow(data.records[rowIndex - 1]);
    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      assertSafeSpreadsheetCell(row[columnIndex], `CSV row ${rowIndex} column ${columnIndex + 1}`);
      ensure(row[columnIndex] === expected[columnIndex], `CSV row ${rowIndex} does not match public JSON.`);
    }
  }
  return rows;
}

function findZipEnd(buffer) {
  const minimum = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("XLSX package is missing its central directory.");
}

function readZipEntries(buffer) {
  ensure(buffer.length >= 22, "XLSX package is truncated.");
  const endOffset = findZipEnd(buffer);
  const disk = buffer.readUInt16LE(endOffset + 4);
  const centralDisk = buffer.readUInt16LE(endOffset + 6);
  const diskEntries = buffer.readUInt16LE(endOffset + 8);
  const entryCount = buffer.readUInt16LE(endOffset + 10);
  const centralSize = buffer.readUInt32LE(endOffset + 12);
  const centralOffset = buffer.readUInt32LE(endOffset + 16);
  const commentLength = buffer.readUInt16LE(endOffset + 20);
  ensure(disk === 0 && centralDisk === 0 && diskEntries === entryCount, "Multi-disk XLSX packages are forbidden.");
  ensure(entryCount < 0xffff && centralSize < 0xffffffff && centralOffset < 0xffffffff, "ZIP64 XLSX packages are forbidden.");
  ensure(entryCount > 0 && entryCount <= LIMITS.xlsxEntries, "XLSX package entry count is out of bounds.");
  ensure(endOffset + 22 + commentLength === buffer.length, "XLSX package has an invalid trailing comment.");
  ensure(commentLength === 0, "XLSX package comments are forbidden.");
  ensure(centralOffset + centralSize <= endOffset, "XLSX central directory is out of bounds.");

  const entries = [];
  const names = new Set();
  let offset = centralOffset;
  let expandedBytes = 0;
  for (let index = 0; index < entryCount; index += 1) {
    ensure(offset + 46 <= buffer.length && buffer.readUInt32LE(offset) === 0x02014b50, "XLSX central directory is invalid.");
    const flags = buffer.readUInt16LE(offset + 8);
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const expandedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const entryCommentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const headerEnd = offset + 46 + nameLength + extraLength + entryCommentLength;
    ensure(headerEnd <= buffer.length, "XLSX central-directory entry is truncated.");
    ensure((flags & 0x0001) === 0, "Encrypted XLSX entries are forbidden.");
    ensure(method === 0 || method === 8, "XLSX entry uses an unsupported compression method.");
    ensure(expandedSize <= LIMITS.xlsxEntryBytes, "XLSX entry exceeds the expansion limit.");
    expandedBytes += expandedSize;
    ensure(expandedBytes <= LIMITS.xlsxExpandedBytes, "XLSX package exceeds the expansion limit.");

    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    const normalizedName = name.replace(/\\/gu, "/");
    ensure(name.length > 0 && !name.includes("\0"), "XLSX entry has an invalid name.");
    ensure(
      !normalizedName.startsWith("/") && !normalizedName.split("/").includes(".."),
      "XLSX entry path is unsafe.",
    );
    ensure(!names.has(normalizedName.toLowerCase()), "XLSX package contains duplicate entries.");
    names.add(normalizedName.toLowerCase());

    ensure(localOffset + 30 <= buffer.length && buffer.readUInt32LE(localOffset) === 0x04034b50, "XLSX local entry is invalid.");
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    ensure(dataOffset + compressedSize <= buffer.length, "XLSX entry data is truncated.");
    const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);
    let data;
    try {
      data =
        method === 0
          ? Buffer.from(compressed)
          : inflateRawSync(compressed, { maxOutputLength: LIMITS.xlsxEntryBytes });
    } catch {
      throw new Error("XLSX entry could not be safely decompressed.");
    }
    ensure(data.length === expandedSize, "XLSX entry expansion size is inconsistent.");
    entries.push({ name: normalizedName, data });
    offset = headerEnd;
  }
  ensure(offset === centralOffset + centralSize, "XLSX central-directory size is inconsistent.");
  return entries;
}

export function inspectXlsxEntries(entries) {
  const byName = new Map(entries.map((entry) => [entry.name.toLowerCase(), entry]));
  ensure(byName.has("[content_types].xml") && byName.has("xl/workbook.xml"), "XLSX package is incomplete.");

  for (const entry of entries) {
    const lowerName = entry.name.toLowerCase();
    ensure(
      !/(?:^|\/)(?:activex|embeddings|externallinks)(?:\/|$)|vbaproject\.bin$/u.test(lowerName),
      "XLSX package contains active or externally linked content.",
    );
    if (!lowerName.endsWith(".xml") && !lowerName.endsWith(".rels")) continue;

    const xml = entry.data.toString("utf8");
    assertNoForbiddenContent(decodeXmlEntities(xml), "XLSX XML content");
    ensure(
      !/<(?:[a-z][\w.-]*:)?f(?:\s|>)/iu.test(xml),
      "XLSX formulas are forbidden.",
    );

    if (lowerName.endsWith(".rels")) {
      ensure(!/\bTargetMode\s*=\s*["']External["']/iu.test(xml), "External XLSX relationships are forbidden.");
      ensure(
        !/\bTarget\s*=\s*["'](?:[a-z][a-z0-9+.-]*:|\\\\|\/\/)/iu.test(xml),
        "External XLSX relationship targets are forbidden.",
      );
    }
  }

  const workbook = byName.get("xl/workbook.xml").data.toString("utf8");
  ensure(
    !/<(?:[a-z][\w.-]*:)?sheet\b[^>]*\bstate\s*=\s*["'](?:hidden|veryHidden)["']/iu.test(workbook),
    "Hidden XLSX sheets are forbidden.",
  );
}

export function inspectXlsxBuffer(buffer) {
  ensure(Buffer.isBuffer(buffer), "XLSX package must be a buffer.");
  ensure(buffer.length <= LIMITS.xlsxBytes, "XLSX package exceeds the file-size limit.");
  const entries = readZipEntries(buffer);
  inspectXlsxEntries(entries);
  return entries;
}

async function readBoundedFile(url, maximum, context) {
  const stats = await fs.stat(url);
  ensure(stats.isFile(), `${context} must be a regular file.`);
  ensure(stats.size <= maximum, `${context} exceeds the file-size limit.`);
  const buffer = await fs.readFile(url);
  ensure(buffer.length <= maximum, `${context} exceeds the file-size limit.`);
  return buffer;
}

export async function validatePublicDataFiles() {
  const jsonBuffer = await readBoundedFile(JSON_URL, LIMITS.jsonBytes, "Public JSON");
  let data;
  try {
    data = JSON.parse(jsonBuffer.toString("utf8"));
  } catch {
    throw new Error("Public JSON is malformed.");
  }
  validateDataset(data);

  const csvBuffer = await readBoundedFile(CSV_URL, LIMITS.csvBytes, "Public CSV");
  validateCsvText(csvBuffer.toString("utf8"), data);

  const xlsxBuffer = await readBoundedFile(XLSX_URL, LIMITS.xlsxBytes, "Public XLSX");
  inspectXlsxBuffer(xlsxBuffer);

  console.log(
    `Validated ${data.records.length.toLocaleString()} records, ${data.metadata.totals.publicSources.toLocaleString()} public sources, and JSON/CSV/XLSX safety controls.`,
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await validatePublicDataFiles();
