---
sidebar_position: 1
---

# Security

FreshGuard Core includes built-in security features. You are responsible for infrastructure and network security around it.

## What FreshGuard protects against

- **SQL injection** — Query validation, pattern matching, and input sanitization
- **Information disclosure** — Error messages are sanitized (no credentials or internal details leak)
- **Denial of service** — Connection and query timeouts, circuit breakers
- **Path traversal** — Safe file handling for DuckDB and configuration files

## What you must secure

- **Network** — Firewalls, VPC, security groups
- **Operating system** — Patching, hardening
- **Database** — User permissions, SSL, access controls
- **Credentials** — Secret management, environment variables
- **Infrastructure** — Container security, access logging

## Security architecture

```
┌──────────────────────────────────────────┐
│          Network Security                │
│          (your responsibility)           │
├──────────────────────────────────────────┤
│          Infrastructure Security         │
│          (your responsibility)           │
├──────────────────────────────────────────┤
│       FreshGuard Core                    │
│  • Input validation                      │
│  • SQL injection prevention              │
│  • Error sanitization                    │
│  • Timeout protection                    │
│  • Circuit breakers                      │
│  • Structured logging                    │
├──────────────────────────────────────────┤
│          Database Security               │
│          (your responsibility)           │
└──────────────────────────────────────────┘
```

## Security checklist

### Application

- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for all credentials
- [ ] Enable SSL for database connections
- [ ] Use dedicated read-only database users
- [ ] Set appropriate query timeouts

### Infrastructure

- [ ] Keep OS and Node.js updated
- [ ] Configure firewall rules
- [ ] Don't expose database ports publicly
- [ ] Run containers as non-root
- [ ] Use secrets management (not env vars in production Docker)

### Database

- [ ] Create a read-only user for FreshGuard
- [ ] Grant only `SELECT` permissions
- [ ] Enable SSL/TLS connections
- [ ] Use certificate-based auth where possible

## Read-only database user setup

```sql
-- PostgreSQL
CREATE ROLE freshguard_readonly;
GRANT CONNECT ON DATABASE myapp TO freshguard_readonly;
GRANT USAGE ON SCHEMA public TO freshguard_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO freshguard_readonly;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON ALL TABLES IN SCHEMA public FROM freshguard_readonly;

CREATE USER freshguard_monitor WITH PASSWORD 'secure_random_password';
GRANT freshguard_readonly TO freshguard_monitor;
```

## SSL configuration

```typescript
// Always use SSL in production
const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});
```

## Error sanitization

FreshGuard automatically sanitizes error messages. Raw database errors (which may contain connection strings, usernames, or internal paths) are mapped to safe messages:

```typescript
try {
  await connector.getRowCount('orders');
} catch (error) {
  // error.message is safe to log and display
  // error.sanitized === true
  logger.error(error.message);
}
```

For the comprehensive self-hosting security guide, see [`docs/SECURITY_FOR_SELF_HOSTERS.md`](https://github.com/freshguard-dev/freshguard-core/blob/main/docs/SECURITY_FOR_SELF_HOSTERS.md) in the repository.
