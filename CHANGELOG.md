# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.19.0] - 2026-02-19

### Added
- **Entra Service Principal authentication** for `MSSQLConnector`, `AzureSQLConnector`, and
  `SynapseConnector` — pass `options.authentication` with a standard mssql
  `azure-active-directory-service-principal-secret` block; `username`/`password` are then
  optional and may be left as empty strings

## [0.18.1] - 2026-02-18

### Security
- Bump `fast-xml-parser` override from 5.3.4 → 5.3.6 to fix high-severity DoS vulnerability via DOCTYPE entity expansion (GHSA-jmr7-xgp7-cmfj)

## [0.18.0] - 2026-02-17

### Added
- **Volume threshold monitoring** (`checkVolumeThreshold`) — simple min/max row count alerting without historical baselines (#65)
- `volume_threshold` added to `RuleType` union
- `minRowThreshold` and `maxRowThreshold` fields on `MonitoringRule`

## [0.17.0] - 2026-02-16

### Added
- `BigQueryConnector.setDataset()` / `getDataset()` to scope `listTables()` to a single dataset (#54)
- `options.dataset` support in `ConnectorConfig` for BigQuery — required when the service account only has dataset-level permissions

## [0.15.5] - 2026-02-16

### Fixed
- BigQuery connector no longer hardcodes location to `'US'` — accepts `options.location` in `ConnectorConfig` and auto-detects from the first accessible dataset when not specified (#51)
- MSSQL, Azure SQL, and Synapse connectors no longer hardcode schema to `'dbo'` — accepts `options.schema`
- PostgreSQL and Redshift connectors no longer hardcode schema to `'public'` — accepts `options.schema`
- Snowflake connector now accepts `options.schema` and `options.warehouse` via the constructor

### Changed
- `ConnectorConfig` now accepts an optional `options` record for connector-specific settings
- Updated SKILL.md, README, CLAUDE.md, and SELF_HOSTING.md to document `options` across all connectors

## [0.15.0] - 2026-02-12

### Added
- **SKILL.md agent skills directory** — instruction-style documentation for AI coding agents, wired via `agentskills` field in package.json
- **Per-export API reference** in README — tables for monitoring functions, connectors, metadata storage, errors, and key types
- **"When to use this"** paragraph in README for quick orientation
- **Compatibility section** in README documenting Node, TypeScript, and ESM requirements

### Changed
- JSDoc comments now preserved in shipped `.d.ts` files (`removeComments: false` in tsconfig)
- Enhanced JSDoc on all 9 connector constructors with `@param`, `@example` tags
- Added module-level JSDoc to `connectors/index`, `monitor/index`, `metadata/index`, `db/index`
- Added `@example` to `MonitoringRule`, `CheckResult`, and `DataSource` type interfaces
- Improved `createDatabase()` JSDoc with usage example
- Documentation site with versioned API reference

## [0.12.0] - 2026-02-10

### Added
- Security linting enforced in CI pipeline
- ESLint security plugins (`eslint-plugin-no-secrets`, `eslint-plugin-security`)

### Changed
- Updated all dependencies to latest versions

## [0.11.3] - 2026-02-07

### Changed
- Updated dependencies and bumped version

## [0.11.2] - 2026-02-01

### Added
- Comprehensive `SECURITY.md` with threat model documentation

### Fixed
- Override `fast-xml-parser` to address CVE-2026-25128

### Changed
- Migrated repository from `thias-se` to `freshguard-dev` organization

## [0.11.1] - 2026-01-28

### Changed
- Documentation overhaul — README and docs updated to reflect actual project state

## [0.11.0] - 2026-01-27

### Added
- **MySQL connector** (`MySQLConnector`)
- **Amazon Redshift connector** (`RedshiftConnector`)

## [0.10.0] - 2026-01-27

### Added
- **Schema change monitoring** (`checkSchemaChanges`) — detect added, removed, and modified columns
- Configurable adaptation modes: `auto`, `manual`, `alert_only`
- Monitoring modes: `full` (all columns) and `partial` (selected columns)
- Schema baseline management and persistence via metadata storage

## [0.9.1] - 2026-01-27

### Fixed
- Security query patterns updated to support new Connector interface operations
- Resolved pnpm security vulnerabilities in CI workflows

## [0.9.0] - 2026-01-26

### Changed
- **BREAKING**: Monitoring functions (`checkFreshness`, `checkVolumeAnomaly`) now accept a `Connector` interface instead of raw database connections. Update call sites to pass a connector instance.

## [0.8.0] - 2026-01-26

### Added
- Comprehensive debug mode for enhanced developer experience when troubleshooting monitoring pipelines

## [0.7.0] - 2026-01-25

### Added
- Configurable PostgreSQL schema support (custom schema names)
- Enhanced baseline calculation for freshness monitoring

## [0.6.0] - 2026-01-24

### Added
- **Metadata storage abstraction** — `MetadataStorage` interface with DuckDB and PostgreSQL backends
- `createMetadataStorage()` factory for zero-setup self-hosting
- Historical execution tracking for volume anomaly detection

## [0.5.2] - 2026-01-23

### Fixed
- Multiline SQL validation no longer rejects legitimate queries

## [0.5.1] - 2026-01-23

### Fixed
- PostgreSQL multiline query pattern matching bug

## [0.5.0] - 2026-01-23

### Added
- Integration test infrastructure with real database setup (`docker-compose.test.yml`)

## [0.4.2] - 2026-01-22

### Added
- `BigQueryConnector` and `SnowflakeConnector` exported from public API

## [0.4.1] - 2026-01-22

### Fixed
- `pino-pretty` made an optional dependency with graceful fallback

## [0.3.0] - 2026-01-22

### Added
- Comprehensive security hardening for database connectors (Phase 1 & 2)
  - SQL injection protection and query validation
  - Input sanitization and identifier validation
  - Error sanitization (no credential leakage)
  - Circuit breaker, retry, and timeout protection
- Error classes exported from main module API (`SecurityError`, `ConnectionError`, `TimeoutError`, `QueryError`, `ConfigurationError`, `MonitoringError`)
- SBOM generation and cosign package signing in publish workflow

## [0.2.0] - 2026-01-21

### Added
- **BigQuery connector** (`BigQueryConnector`)
- **Snowflake connector** (`SnowflakeConnector`)

## [0.1.2] - 2026-01-21

### Fixed
- Ensure pnpm is available during npm publish
- Enable automatic release notes in CI

## [0.1.1] - 2026-01-21

### Fixed
- CI/CD publishing workflow fixes for npm trusted publishing

## [0.1.0] - 2026-01-21

### Added
- Initial release
- **Freshness monitoring** (`checkFreshness`) — detect stale data based on timestamp columns
- **Volume anomaly detection** (`checkVolumeAnomaly`) — identify unexpected row count changes
- **PostgreSQL connector** (`PostgresConnector`)
- **DuckDB connector** (`DuckDBConnector`)
- CLI tool (`freshguard` command)
- Drizzle ORM database schema and migrations
- MIT license

[Unreleased]: https://github.com/freshguard-dev/freshguard-core/compare/v0.18.0...HEAD
[0.18.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.17.0...v0.18.0
[0.15.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.12.0...v0.15.0
[0.12.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.11.3...v0.12.0
[0.11.3]: https://github.com/freshguard-dev/freshguard-core/compare/v0.11.2...v0.11.3
[0.11.2]: https://github.com/freshguard-dev/freshguard-core/compare/v0.11.1...v0.11.2
[0.11.1]: https://github.com/freshguard-dev/freshguard-core/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/freshguard-dev/freshguard-core/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.5.2...v0.6.0
[0.5.2]: https://github.com/freshguard-dev/freshguard-core/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/freshguard-dev/freshguard-core/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/freshguard-dev/freshguard-core/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/freshguard-dev/freshguard-core/compare/v0.3.0...v0.4.1
[0.3.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/freshguard-dev/freshguard-core/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/freshguard-dev/freshguard-core/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/freshguard-dev/freshguard-core/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/freshguard-dev/freshguard-core/releases/tag/v0.1.0
