# NC Smart-City Systems Atlas

A local community-preview prototype built from David Gitman's 2026 municipal
internship research. The two working research tables are merged into one
source-linked Smart-City Systems dataset; AI is a classification and reporting
lens inside that system.

The public build includes only records with a safe public source. It excludes
source workbooks, personal contacts, raw notes, internal links, access-control
analysis, administrative files, Town budget inputs, and records without a safe
public source. It is not yet approved for public release.

Community project files:

- `CONTRIBUTING.md`
- `DATA_DICTIONARY.md`
- `GOVERNANCE.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`

## Run locally

```bash
npm install
npm run dev
```

## Validate

```bash
npm run validate:data
npm run build
npm test
```

`npm run build` runs the public-data validator automatically through the
`prebuild` lifecycle hook. Validation checks the canonical JSON schema and
limits, public URL policy, CSV parity and formula safety, and the XLSX package
for formulas, external relationships, hidden sheets, and forbidden content.

## Search indexing and webmaster verification

The prototype defaults to `noindex, nofollow`, and `/robots.txt` disallows
crawling because the project is still labeled “Not approved for public
release.” The code still emits unique canonical URLs, page-specific social
metadata, structured data, and a complete sitemap so the site is ready for an
approved public launch.

Only after publication approval, set:

```bash
NEXT_PUBLIC_ALLOW_INDEXING=true
NEXT_PUBLIC_SITE_URL=https://nc-smart-cities.dgitman.workers.dev
```

For a future custom domain, set `NEXT_PUBLIC_SITE_URL` to that origin before
building or deploying so canonicals, structured data, and sitemap URLs remain
consistent. Redirect the old Workers hostname to the chosen canonical domain.

Google Search Console and Bing Webmaster Tools verification tags are supported
through these optional, non-secret values:

```bash
GOOGLE_SITE_VERIFICATION=verification-token
BING_SITE_VERIFICATION=verification-token
```

After enabling indexing, register the canonical property in both webmaster
tools and submit `/sitemap.xml`. Search analytics or Cloudflare Web Analytics
can then measure discovery; analytics configuration is intentionally not
hard-coded into this repository.

## Indexable routes

- `/cities` and `/cities/[slug]` group records by jurisdiction.
- `/pillars` and `/pillars/[slug]` group records by the six-pillar taxonomy.
- `/systems/[id]` gives every published record a stable evidence page.
- `/about` documents project identity, scope, downloads, and a suggested
  versioned citation.
