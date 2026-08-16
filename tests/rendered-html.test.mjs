import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const repoDirectory = fileURLToPath(new URL("..", import.meta.url));

const routes = [
  ["/", "A smart city is a portfolio", "NC Smart-City Systems Atlas"],
  ["/explore", "Explore systems with the evidence", "Explore the Atlas"],
  ["/ai", "AI is a subset of the municipal system", "AI Report"],
  ["/cities", "Compare municipal systems community by community", "North Carolina Communities"],
  ["/cities/raleigh", "Raleigh municipal technology systems", "Raleigh Municipal Technology Systems"],
  ["/pillars", "Six civic pillars make unlike systems comparable", "Civic Technology Pillars"],
  ["/pillars/mobility-and-transport", "Mobility &amp; Transport", "Mobility &amp; Transport Systems"],
  ["/systems/ncs-b3158c065cb0", "Ask Apex", "Ask Apex in Apex"],
  ["/sources", "The source is part of the record", "Source Registry"],
  ["/methodology", "Transparent enough to challenge", "Method &amp; Limitations"],
  ["/contribute", "Make the atlas more accurate", "Contribute"],
  ["/about", "A public-evidence atlas built to be examined", "About the Atlas"],
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
    "../app/cities/page.tsx",
    "../app/cities/[slug]/page.tsx",
    "../app/pillars/page.tsx",
    "../app/pillars/[slug]/page.tsx",
    "../app/systems/[id]/page.tsx",
    "../app/record-components.tsx",
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

test("each indexable content route emits its own canonical and social URL", async () => {
  const paths = [
    "/",
    "/explore",
    "/ai",
    "/cities",
    "/cities/raleigh",
    "/pillars/mobility-and-transport",
    "/systems/ncs-b3158c065cb0",
    "/about",
  ];

  for (const path of paths) {
    const response = await render(path);
    const html = await response.text();
    const expected = `https://nc-smart-cities.dgitman.workers.dev${path === "/" ? "" : path}`;
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, `${path} must have one canonical`);
    assert.match(html, new RegExp(`rel="canonical" href="${expected}"`));
    assert.match(html, new RegExp(`property="og:url" content="${expected}"`));
  }
});

test("homepage title is not duplicated and Dataset JSON-LD is present", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /<title>NC Smart-City Systems Atlas<\/title>/);
  assert.doesNotMatch(html, /NC Smart-City Systems Atlas \| NC Smart-City Systems Atlas/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type":"Dataset"/);
  assert.match(html, /smart-city-systems\.json/);
});

test("unapproved preview remains noindex until publication is explicitly enabled", async () => {
  const response = await render("/");
  const html = await response.text();
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  assert.match(html, /<meta name="googlebot" content="noindex, nofollow"/);
});

test("unapproved previews let crawlers read noindex without advertising routes", async () => {
  const robotsResponse = await render("/robots.txt");
  assert.equal(robotsResponse.status, 200);
  assert.match(robotsResponse.headers.get("content-type") ?? "", /^text\/plain\b/i);
  const robots = await robotsResponse.text();
  assert.match(robots, /User-Agent: \*/i);
  assert.match(robots, /Allow: \//i);
  assert.doesNotMatch(robots, /Disallow:/i);
  assert.doesNotMatch(robots, /Sitemap:/i);

  const sitemapResponse = await render("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemapResponse.headers.get("content-type") ?? "", /application\/xml/i);
  const sitemap = await sitemapResponse.text();
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 0);
});

test("publication opt-in enables indexing and exposes every sitemap URL", async () => {
  const defaultBuildEnvironment = { ...process.env };
  delete defaultBuildEnvironment.NEXT_PUBLIC_ALLOW_INDEXING;
  const enabledBuildEnvironment = {
    ...defaultBuildEnvironment,
    NEXT_PUBLIC_ALLOW_INDEXING: "true",
  };
  const probe = `
    const { default: worker } = await import("./dist/server/index.js?indexing-probe=" + Date.now());
    const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
    const ctx = { waitUntil() {}, passThroughOnException() {} };
    async function body(path, accept) {
      const response = await worker.fetch(new Request("http://localhost" + path, { headers: { accept } }), env, ctx);
      return response.text();
    }
    const html = await body("/", "text/html");
    const robots = await body("/robots.txt", "text/plain");
    const sitemap = await body("/sitemap.xml", "application/xml");
    console.log(JSON.stringify({
      pageHasIndex: /<meta name="robots" content="index, follow"/.test(html),
      robots,
      urlCount: (sitemap.match(/<url>/g) || []).length,
      hasCity: sitemap.includes("/cities/raleigh"),
      hasPillar: sitemap.includes("/pillars/mobility-and-transport"),
      hasSystem: sitemap.includes("/systems/ncs-b3158c065cb0"),
    }));
  `;

  try {
    await execFileAsync("npm", ["run", "build"], {
      cwd: repoDirectory,
      env: enabledBuildEnvironment,
    });
    const { stdout } = await execFileAsync(
      "node",
      ["--input-type=module", "-e", probe],
      { cwd: repoDirectory, env: enabledBuildEnvironment },
    );
    const result = JSON.parse(stdout);

    assert.equal(result.pageHasIndex, true);
    assert.match(result.robots, /Allow: \//i);
    assert.match(result.robots, /Sitemap: https:\/\/nc-smart-cities\.dgitman\.workers\.dev\/sitemap\.xml/i);
    assert.equal(result.urlCount, 717);
    assert.equal(result.hasCity, true);
    assert.equal(result.hasPillar, true);
    assert.equal(result.hasSystem, true);
  } finally {
    await execFileAsync("npm", ["run", "build"], {
      cwd: repoDirectory,
      env: defaultBuildEnvironment,
    });
  }
});

test("unknown SEO detail routes return 404", async () => {
  for (const path of [
    "/cities/not-a-place",
    "/pillars/not-a-pillar",
    "/systems/not-a-record",
    "/systems/%25",
  ]) {
    const response = await render(path);
    assert.equal(response.status, 404);
  }
});

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
