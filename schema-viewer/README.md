# Schema Viewer

An interactive browser for `workflowMigration.schema.json`. Two-column layout: a collapsible field tree on the left, a detail card on the right. No build step — four static files served directly.

**Live site:** `https://opensearch-project.github.io/opensearch-migrations/`

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
| `schemas/versions.json` | Generated at deploy time — version manifest |
| `schemas/<version>.json` | Generated at deploy time — one file per release |

## Schema versions

Schema files are **not stored in this repository**. They are downloaded from GitHub Release assets at deploy time by `.github/workflows/deploy-schema-viewer.yml`.

On each deployment the workflow:

1. Queries the `opensearch-project/opensearch-migrations` Releases API for all releases that include `workflowMigration.schema.json`
2. Downloads each schema to `schemas/<version>.json`
3. Generates `schemas/versions.json` with the ordered version list and `latest` pointer

A new schema version becomes available in the viewer automatically when its GitHub Release is published — no manual steps or commits required.

## Deployment

`.github/workflows/deploy-schema-viewer.yml` triggers on:

- **Push to `main`** touching `schema-viewer/**` — for viewer code changes
- **Release published** — picks up the new schema and redeploys
- **Manual** via `workflow_dispatch`
