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
