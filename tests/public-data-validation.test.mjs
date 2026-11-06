import assert from "node:assert/strict";
import test from "node:test";

import {
  assertSafeSpreadsheetCell,
  assertSafeString,
  inspectXlsxEntries,
  validatePublicUrl,
} from "../scripts/validate-public-data.mjs";

const acceptedUrls = [
  ["https://secure.apexnc.org/eSuite.Permits/WelcomePage.aspx", "secure.apexnc.org"],
  ["https://myaccount.apexnc.org/portal/", "myaccount.apexnc.org"],
  ["https://www.apexnc.org/DocumentCenter/View/50713", "apexnc.org"],
  ["http://example.gov/public-record", "example.gov"],
];

for (const [url, domain] of acceptedUrls) {
  test(`accepts public source URL ${domain}`, () => {
    assert.doesNotThrow(() => validatePublicUrl(url, domain));
  });
}

const rejectedUrls = [
  ["non-HTTP scheme", "javascript:alert(1)", "example.gov"],
  ["URL user information", "https://user:password@example.gov/source", "example.gov"],
  ["collaboration host", "https://tenant.sharepoint.com/source", "tenant.sharepoint.com"],
  ["login host", "https://login.example.gov/source", "login.example.gov"],
  ["local suffix", "https://records.example.local/source", "records.example.local"],
  ["internal suffix", "https://records.example.internal/source", "records.example.internal"],
  ["intranet suffix", "https://records.example.intranet/source", "records.example.intranet"],
  ["loopback IPv4", "http://127.0.0.1/source", "127.0.0.1"],
  ["numeric loopback IPv4", "http://2130706433/source", "127.0.0.1"],
  ["hex loopback IPv4", "http://0x7f000001/source", "127.0.0.1"],
  ["private IPv4", "http://192.168.1.10/source", "192.168.1.10"],
  ["link-local IPv4", "http://169.254.169.254/source", "169.254.169.254"],
  ["unspecified IPv4", "http://0.0.0.0/source", "0.0.0.0"],
  ["loopback IPv6", "http://[::1]/source", "[::1]"],
  ["private IPv6", "http://[fc00::1]/source", "[fc00::1]"],
  ["link-local IPv6", "http://[fe80::1]/source", "[fe80::1]"],
  ["mapped loopback IPv6", "http://[::ffff:127.0.0.1]/source", "[::ffff:7f00:1]"],
  ["admin path", "https://example.gov/admin/source", "example.gov"],
  ["secret query variant", "https://example.gov/source?client_secret=value", "example.gov"],
  ["AWS secret query variant", "https://example.gov/source?X-Amz-Credential=value", "example.gov"],
  ["mismatched display domain", "https://attacker.example/source", "example.gov"],
];

for (const [name, url, domain] of rejectedUrls) {
  test(`rejects ${name}`, () => {
    assert.throws(() => validatePublicUrl(url, domain));
  });
}

test("URL rejection errors do not disclose rejected values", () => {
  const marker = "do-not-log-this-value";
  assert.throws(
    () => validatePublicUrl(`https://example.gov/source?client_secret=${marker}`, "example.gov"),
    (error) => !error.message.includes(marker),
  );
});

const rejectedStrings = [
  JSON.parse('"person\\u0040example.com"'),
  "person%40example.com",
  "password = do-not-publish",
  "-----BEGIN PRIVATE KEY-----",
];

for (const value of rejectedStrings) {
  test("rejects normalized sensitive string", () => {
    assert.throws(() => assertSafeString(value));
  });
}

for (const value of ["=HYPERLINK(\"https://example.test\")", " +SUM(1,2)", "\t@command"] ) {
  test("rejects formula-leading spreadsheet cell", () => {
    assert.throws(() => assertSafeSpreadsheetCell(value));
  });
}

function xlsxEntries(overrides = {}) {
  const content = {
    "[Content_Types].xml": "<Types />",
    "xl/workbook.xml": '<workbook><sheets><sheet name="Records" /></sheets></workbook>',
    "xl/worksheets/sheet1.xml": "<worksheet><sheetData /></worksheet>",
    ...overrides,
  };
  return Object.entries(content).map(([name, value]) => ({ name, data: Buffer.from(value) }));
}

test("accepts a visible formula-free XLSX package", () => {
  assert.doesNotThrow(() => inspectXlsxEntries(xlsxEntries()));
});

const rejectedXlsx = [
  ["formula", { "xl/worksheets/sheet1.xml": "<worksheet><c><f>WEBSERVICE(\"https://example.test\")</f></c></worksheet>" }],
  ["hidden sheet", { "xl/workbook.xml": '<workbook><sheets><sheet name="Hidden" state="veryHidden" /></sheets></workbook>' }],
  ["external relationship", { "xl/worksheets/_rels/sheet1.xml.rels": '<Relationships><Relationship Target="https://example.test" TargetMode="External" /></Relationships>' }],
  ["encoded forbidden text", { "xl/sharedStrings.xml": "<sst><si><t>person&#64;example.com</t></si></sst>" }],
];

for (const [name, overrides] of rejectedXlsx) {
  test(`rejects XLSX ${name}`, () => {
    assert.throws(() => inspectXlsxEntries(xlsxEntries(overrides)));
  });
}
