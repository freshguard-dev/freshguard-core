---
sidebar_position: 1
slug: /
---

# Introduction

FreshGuard Core is an open-source, MIT-licensed data pipeline freshness monitoring engine. It detects stale data, volume anomalies, and schema changes across PostgreSQL, DuckDB, BigQuery, Snowflake, MySQL, and Redshift.

## What it does

- **Freshness monitoring** — Alert when a table hasn't been updated within a tolerance window
- **Volume anomaly detection** — Alert when row counts deviate from a calculated baseline
- **Schema change detection** — Alert when columns are added, removed, or modified

## Who it's for

- Teams running data pipelines who want monitoring without SaaS lock-in
- Self-hosters who want to run on their own infrastructure
- Developers building custom data quality tooling

## Architecture

```
CLI / Direct API
        |
Monitoring Algorithms
  checkFreshness · checkVolumeAnomaly · checkSchemaChanges
        |
Database Connectors
  PostgreSQL · DuckDB · BigQuery · Snowflake · MySQL · Redshift
        |
Metadata Storage (optional)
  DuckDB (embedded) or PostgreSQL
```

Each monitoring function validates its inputs, queries the target database through a connector, analyzes the result, and returns a `CheckResult` with a status (`ok`, `alert`, or `failed`).

For the full architectural breakdown, see the [Architecture doc](https://github.com/freshguard-dev/freshguard-core/blob/main/docs/ARCHITECTURE.md).

## Open Core model

This package is the **open-source core**. It contains all monitoring logic, connectors, and CLI tooling under the MIT license. It does not include multi-tenant features, authentication, dashboards, or billing — those are part of the separate FreshGuard Cloud product.

You can use, modify, and distribute this core freely.

## Next steps

- [Install the package](/docs/getting-started/installation)
- [Run your first check](/docs/getting-started/quick-start)
- [Browse the API reference](/docs/api)
