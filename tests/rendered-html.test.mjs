import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const routes = [
  ["/", "A smart city is a portfolio", "NC Smart-City Systems Atlas"],
  ["/explore", "Explore systems with the evidence", "Explore the Atlas"],
  ["/ai", "AI is a subset of the municipal system", "AI Report"],
  ["/sources", "The source is part of the record", "Source Registry"],
  ["/methodology", "Transparent enough to challenge", "Method &amp; Limitations"],
  ["/contribute", "Make the atlas more accurate", "Contribute"],
];

async function render(path, headers = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html", ...headers },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("metadata ignores hostile forwarded host headers", async () => {
  const response = await render("/", {
    host: "atlas.example.test",
    "x-forwarded-host": "metadata-attacker.example",
    "x-forwarded-proto": "https",
  });
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.doesNotMatch(html, /metadata-attacker\.example/i);
  assert.match(html, /\/og\.png/i);
});

test("internal navigation uses document links instead of the vinext RSC link runtime", async () => {
  const navigationFiles = [
    "../app/components.tsx",
    "../app/nav-links.tsx",
    "../app/page.tsx",
    "../app/ai/page.tsx",
    "../app/methodology/page.tsx",
    "../app/contribute/page.tsx",
  ];
  const source = (
    await Promise.all(
      navigationFiles.map((path) =>
        fs.readFile(new URL(path, import.meta.url), "utf8"),
      ),
    )
  ).join("\n");

  assert.doesNotMatch(source, /from ["']next\/link["']/);
  assert.doesNotMatch(source, /<\/?Link\b/);
});

for (const [path, copy, title] of routes) {
  test(`server-renders ${path}`, async () => {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, new RegExp(title, "i"));
    assert.match(html, new RegExp(copy, "i"));
    assert.match(html, /Community-preview prototype/i);
    assert.match(html, /Not approved for public release/i);
    assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
  });
}

test("public dataset contains sources and no private-link patterns", async () => {
  const dataUrl = new URL("../public/data/smart-city-systems.json", import.meta.url);
  const raw = await fs.readFile(dataUrl, "utf8");
  const data = JSON.parse(raw);

  assert.ok(data.records.length > 600);
  assert.ok(data.records.every((record) => Array.isArray(record.sources) && record.sources.length > 0));
  assert.doesNotMatch(raw, /sharepoint\.com|drive\.google\.com|mail\.google\.com|onedrive\.live\.com/i);
  assert.doesNotMatch(raw, /\/Users\/|CloudStorage|software budget|access card/i);
  assert.doesNotMatch(raw, /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);

  for (const record of data.records) {
    for (const source of record.sources) {
      assert.equal(
        source.domain.toLowerCase().replace(/^www\./, ""),
        new URL(source.url).hostname.toLowerCase().replace(/^www\./, ""),
        `Source domain must match its URL hostname on ${record.id}.`,
      );
    }
  }
});

test("retired two-study routes are no longer published", async () => {
  for (const path of ["/municipal-ai", "/smart-cities"]) {
    const response = await render(path);
    assert.equal(response.status, 404);
  }
});
