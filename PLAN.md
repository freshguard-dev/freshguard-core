# Documentation Completion Plan — @freshguard/freshguard-core

## Current State Assessment

### What exists
- **README.md** (644 lines) — comprehensive but doubles as API docs since there's no dedicated site
- **10 markdown files** in `docs/` — CONTRIBUTING, SELF_HOSTING, SECURITY guides, metadata schema, debugging, integration guides
- **1 working example** (`examples/basic-freshness-check/`) + 2 loose debug example files
- **JSDoc** present on most public APIs but not all
- **No docs site tooling** — no Docusaurus, VitePress, TypeDoc, or similar

### What's missing
- **No versioned docs site** — no way to serve docs per release
- **No auto-generated API reference** — JSDoc exists but nothing generates browsable HTML from it
- **No CHANGELOG.md** — referenced in `package.json` `"files"` but doesn't exist
- **No ARCHITECTURE.md** — referenced in CLAUDE.md but doesn't exist
- **No LICENSE_CLARIFICATION.md** — referenced in CLAUDE.md but doesn't exist
- **`package.json`** missing `keywords`, `homepage`, `bugs` fields (important for npm discoverability)
- **Incomplete examples** — only 1 real example; no per-connector, volume anomaly, or schema monitoring standalone examples

---

## Phase 1: Package metadata and missing foundational docs

Fix the basics that every public npm package must have.

### 1.1 — `package.json` metadata
Add the missing fields that npm best practices require:
```jsonc
{
  "keywords": ["data-quality", "freshness", "monitoring", "pipeline", "postgresql", "duckdb", "bigquery", "snowflake", "data-observability"],
  "homepage": "https://freshguard.dev/docs",
  "bugs": {
    "url": "https://github.com/freshguard-dev/freshguard-core/issues"
  }
}
```

### 1.2 — CHANGELOG.md
Create using [Keep a Changelog](https://keepachangelog.com/) format. Backfill from git history for the current 0.12.0 release and key prior milestones (0.1.0 initial, notable additions like BigQuery/Snowflake connectors, schema monitoring, metadata storage, security features).

### 1.3 — docs/ARCHITECTURE.md
Document:
- High-level component diagram (connectors → monitor → metadata → alerts)
- Data flow for each monitoring type (freshness, volume, schema)
- Extension points (how to add a connector, how to add a monitor)
- Dependency rationale (why Drizzle, why Zod, why Pino)

### 1.4 — docs/LICENSE_CLARIFICATION.md
Explain the open-core model:
- What's MIT (this repo — everything)
- What's proprietary (freshguard-cloud — separate repo, not here)
- Can you fork? Yes. Can you sell? Yes. Can you use commercially? Yes.
- Relationship between core and cloud

---

## Phase 2: Docs site setup (Docusaurus)

**Recommended tool: [Docusaurus v3](https://docusaurus.io/)** — the de facto standard for versioned npm package documentation (used by React, Jest, Redux, Babel, Prettier, etc.). Has built-in versioning, search, and TypeDoc integration.

Alternative considered: VitePress (used by Vitest/Vite ecosystem). Simpler, but its versioning story is less mature — it requires manual branch/tag management rather than Docusaurus's first-class `docs:version` command.

### 2.1 — Initialize Docusaurus
```
website/               # Docs site lives here (not published to npm)
├── docusaurus.config.ts
├── package.json       # Separate from the library package.json
├── sidebars.ts
├── docs/              # Versioned doc sources
│   ├── intro.md
│   ├── getting-started/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   └── configuration.md
│   ├── guides/
│   │   ├── freshness-monitoring.md
│   │   ├── volume-anomaly.md
│   │   ├── schema-changes.md
│   │   ├── connectors.md
│   │   ├── metadata-storage.md
│   │   ├── error-handling.md
│   │   ├── cli.md
│   │   └── self-hosting.md
│   ├── security/
│   │   ├── overview.md
│   │   └── self-hosting-security.md
│   ├── api/           # Auto-generated from TypeDoc
│   │   └── (generated)
│   ├── examples/
│   │   ├── basic-freshness.md
│   │   ├── volume-monitoring.md
│   │   ├── schema-monitoring.md
│   │   ├── multi-database.md
│   │   ├── custom-alerting.md
│   │   └── docker-deployment.md
│   └── contributing/
│       ├── development-setup.md
│       ├── adding-connectors.md
│       ├── adding-monitors.md
│       └── testing.md
├── src/               # Custom components/pages
│   └── pages/
│       └── index.tsx  # Landing page
├── static/
│   └── img/
└── versioned_docs/    # Created by `docusaurus docs:version`
    └── version-0.12.0/
```

### 2.2 — TypeDoc integration
Install `docusaurus-plugin-typedoc` + `typedoc` + `typedoc-plugin-markdown` to auto-generate API reference pages from the TypeScript source into the Docusaurus site. This means JSDoc comments automatically become browsable, versioned API docs.

### 2.3 — Configure versioning
- Current docs = `next` (unreleased/dev)
- On each npm release, run `pnpm --filter website docusaurus docs:version X.Y.Z`
- Users can switch between versions in the docs site navbar

### 2.4 — Sidebar configuration
Organize into logical sections:
1. Getting Started (install → quick start → configuration)
2. Guides (one per monitoring type, connectors, metadata, error handling, CLI, self-hosting)
3. API Reference (auto-generated, organized by module)
4. Examples (runnable code walkthroughs)
5. Security (overview + self-hosting hardening)
6. Contributing (dev setup, adding connectors, adding monitors, testing)

---

## Phase 3: Content migration and creation

### 3.1 — Migrate existing docs into Docusaurus structure
Move and restructure content from the current flat `docs/` folder:

| Current file | Destination |
|---|---|
| `docs/SELF_HOSTING.md` | `website/docs/guides/self-hosting.md` |
| `docs/SECURITY_FOR_SELF_HOSTERS.md` | `website/docs/security/self-hosting-security.md` |
| `docs/CONTRIBUTING.md` | `website/docs/contributing/development-setup.md` |
| `docs/INTEGRATION_GUIDE.md` | Split into relevant guide pages |
| `docs/METADATA_STORAGE.md` | `website/docs/guides/metadata-storage.md` |
| `docs/DEBUGGING.md` | `website/docs/guides/debugging.md` |
| `docs/DEVELOPER_METADATA_SCHEMA.md` | `website/docs/api/metadata-schema.md` (reference) |
| `docs/INTEGRATION_TESTING.md` | `website/docs/contributing/testing.md` |
| New: `docs/ARCHITECTURE.md` | `website/docs/intro.md` (architecture section) |
| New: `docs/LICENSE_CLARIFICATION.md` | `website/docs/contributing/licensing.md` |

Keep original `docs/` files as-is for GitHub browsing (they serve users who don't visit the docs site). Add a note at the top of each pointing to the docs site for the full versioned version.

### 3.2 — Write new guide content
Create focused, task-oriented guides:

- **Freshness Monitoring Guide** — when to use, configuration options, interpreting results, tolerance tuning
- **Volume Anomaly Guide** — baseline concepts, deviation thresholds, metadata storage requirement
- **Schema Change Guide** — adaptation modes (auto/manual/alert_only), monitoring modes (full/partial), baseline management
- **Connectors Guide** — per-connector setup (PostgreSQL, DuckDB, BigQuery, Snowflake, MySQL, Redshift), connection options, SSL config
- **Error Handling Guide** — error hierarchy, catch patterns, error codes reference table
- **CLI Guide** — all commands, environment variables, config file format

### 3.3 — Slim down README.md
Once the docs site exists, the README becomes a concise entry point:
- One-paragraph description
- Badges (npm, license, CI, docs site link)
- Install command
- One minimal code example (5-10 lines)
- Feature bullet list
- Links to docs site sections (Getting Started, API Reference, Self-Hosting, Contributing)
- License

The detailed examples and API docs move to the docs site where they're versioned and searchable.

---

## Phase 4: JSDoc completion and API reference quality

### 4.1 — Audit all public exports
Every symbol exported from `src/index.ts` needs complete JSDoc:

- **Functions** (`checkFreshness`, `checkVolumeAnomaly`, `checkSchemaChanges`, `createMetadataStorage`, `createDatabase`, `createError`): `@param`, `@returns`, `@throws`, `@example`
- **Classes** (all 6 connectors, 7 error classes, 2 metadata storage classes, `ErrorHandler`): class-level description, constructor `@param`, public method docs
- **Types/Interfaces** (14 exported types): `@description` on type, `@property` on each field
- **Module** (`src/index.ts`): `@module` doc with package overview

### 4.2 — Add `@example` tags
Every public function and class constructor should have at least one `@example` in its JSDoc. These render directly in the TypeDoc-generated API reference.

### 4.3 — Add `@since` tags
Tag exports with the version they were introduced (e.g., `@since 0.1.0`). Useful for users on older versions.

---

## Phase 5: Additional examples

### 5.1 — Expand `examples/` directory
```
examples/
├── basic-freshness-check/     # (existing, keep)
├── volume-monitoring/          # New: standalone volume anomaly example
│   ├── monitor.ts
│   ├── README.md
│   └── package.json
├── schema-change-detection/    # New: schema monitoring with adaptation modes
│   ├── monitor.ts
│   ├── README.md
│   └── package.json
├── multi-connector/            # New: same rules across PostgreSQL + BigQuery
│   ├── monitor.ts
│   ├── README.md
│   └── package.json
├── custom-alerting/            # New: Slack/PagerDuty/webhook integration patterns
│   ├── slack-alerts.ts
│   ├── webhook-alerts.ts
│   ├── README.md
│   └── package.json
└── docker-production/          # New: production Docker Compose setup
    ├── docker-compose.yml
    ├── freshguard.config.ts
    ├── Dockerfile
    └── README.md
```

### 5.2 — Remove loose debug example files
Move `examples/debug-mode-implementation.ts` and `examples/freshness-debug-patch.ts` into the docs site's debugging guide as inline code blocks rather than standalone files.

---

## Phase 6: CI/CD for docs

### 6.1 — GitHub Actions: deploy docs
Create `.github/workflows/deploy-docs.yml`:
- **Trigger**: push to `main`, or manual dispatch
- **Steps**: install → build library → generate TypeDoc → build Docusaurus → deploy to GitHub Pages (or Vercel/Netlify)
- **Versioning step**: on release tags, run `docs:version` before building

### 6.2 — GitHub Actions: docs PR preview
On pull requests that touch `website/` or `src/` (JSDoc changes), build the docs and post a preview link comment.

### 6.3 — Add docs scripts to root package.json
```jsonc
{
  "scripts": {
    "docs:dev": "pnpm --filter website start",
    "docs:build": "pnpm --filter website build",
    "docs:version": "pnpm --filter website docusaurus docs:version"
  }
}
```

---

## Phase 7: Final polish

### 7.1 — Search
Enable Docusaurus local search plugin (`@easyops-cn/docusaurus-search-local`) or Algolia DocSearch (free for open source).

### 7.2 — Badges and shields
Add to README: docs site link badge, npm downloads, bundle size, Node.js version, TypeScript badge.

### 7.3 — `docs` field in package.json
```jsonc
{ "homepage": "https://freshguard.dev/docs" }
```
npm shows this as the package homepage on npmjs.com.

### 7.4 — Cross-link everything
- README → docs site
- docs site → npm package
- docs site → GitHub repo
- Each guide → related API reference pages
- API reference → related guides
- Examples → guides that explain them

---

## Implementation Order

| Step | Phase | Description |
|------|-------|-------------|
| 1 | 1.1 | Fix package.json metadata |
| 2 | 1.2 | Create CHANGELOG.md |
| 3 | 1.3 | Create ARCHITECTURE.md |
| 4 | 1.4 | Create LICENSE_CLARIFICATION.md |
| 5 | 2.1 | Initialize Docusaurus in `website/` |
| 6 | 2.2 | Configure TypeDoc plugin |
| 7 | 2.3 | Configure versioning |
| 8 | 2.4 | Set up sidebar |
| 9 | 3.1 | Migrate existing docs |
| 10 | 3.2 | Write new guide content |
| 11 | 3.3 | Slim down README |
| 12 | 4.1–4.3 | Complete JSDoc on all public APIs |
| 13 | 5.1–5.2 | Create additional examples |
| 14 | 6.1–6.3 | Set up docs CI/CD |
| 15 | 7.1–7.4 | Search, badges, cross-links |
