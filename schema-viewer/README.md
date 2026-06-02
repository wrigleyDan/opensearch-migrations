# Schema Viewer

An interactive browser for `workflowMigration.schema.json`. Two-column layout: a collapsible field tree on the left, a detail card on the right. No build step — four static files served directly.

**Live site:** `https://wrigleydan.github.io/opensearch-migrations/`

## Features

- Collapsible sidebar tree with live search
- Field cards showing type, requirement, default, and description
- `oneOf`/`anyOf` variant rows and per-variant property tables
- Expert field labelling — fields whose description begins with `[Expert]` get a badge and the prefix is stripped from the visible text
- Version selector — switch between all schema releases that include the asset

## Running locally

```sh
cd schema-viewer
npm run dev
```

Then open `http://localhost:3000/`. The dev server serves the `schema-viewer/` directory directly.

## Running tests

```sh
npm test          # single run
npm run test:watch  # re-runs on every file save
```

Tests cover the pure logic in `schema-utils.js` — tree building, search filtering, type labels, variant titles, and expert-field helpers. DOM rendering is not unit tested.

## File structure

| File | Purpose |
|---|---|
| `index.html` | HTML shell — version selector, search input, tree and detail panel |
| `viewer.js` | DOM rendering, event wiring, fetch/init logic |
| `schema-utils.js` | Pure logic functions — tree building, type helpers, expert-field handling |
| `schema-utils.test.js` | Vitest unit tests for `schema-utils.js` |
| `viewer.css` | Styles |
| `schemas/versions.json` | Version manifest: `{ "latest": "x.y.z", "versions": [...] }` |
| `schemas/<version>.json` | One schema file per release |

## Adding a new schema version

Schema files are updated automatically on every push to `main` that changes schema-related source paths. The `publish-schema-to-pages` job in `.github/workflows/generate-workflow-schema.yaml`:

1. Reads the version from the `VERSION` file
2. Copies the generated schema to `schemas/<version>.json`
3. Prepends the version to `schemas/versions.json` and updates `latest`
4. Commits the changes, which triggers a Pages redeploy

To add a version manually, download the release asset and update the manifest:

```sh
gh release download <version> \
  --repo opensearch-project/opensearch-migrations \
  --pattern workflowMigration.schema.json \
  --output schemas/<version>.json

node -e "
  const fs = require('fs');
  const meta = JSON.parse(fs.readFileSync('schemas/versions.json', 'utf8'));
  meta.versions.unshift('<version>');
  meta.latest = '<version>';
  fs.writeFileSync('schemas/versions.json', JSON.stringify(meta, null, 2) + '\n');
"
```

## Deployment

Pushes to `main` that touch `schema-viewer/**` trigger `.github/workflows/deploy-schema-viewer.yml`, which deploys the `schema-viewer/` directory to GitHub Pages via `actions/deploy-pages`.
