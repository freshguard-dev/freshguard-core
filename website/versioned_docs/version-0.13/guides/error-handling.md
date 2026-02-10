---
sidebar_position: 6
---

# Error Handling

FreshGuard Core exports typed error classes for precise error handling. All errors extend `FreshGuardError` and include sanitized messages safe for logging.

## Error hierarchy

```
FreshGuardError (base)
├── SecurityError        — SQL injection, blocked queries
├── ConnectionError      — Network, authentication failures
├── TimeoutError         — Query/connection timeouts
├── QueryError           — Bad SQL, missing tables
├── ConfigurationError   — Invalid config values
├── MonitoringError      — Check execution failures
└── MetadataStorageError — Storage operation failures
```

## Usage

```typescript
import {
  checkFreshness,
  SecurityError,
  ConnectionError,
  TimeoutError,
  QueryError,
  ConfigurationError,
  MonitoringError,
} from '@freshguard/freshguard-core';

try {
  const result = await checkFreshness(connector, rule);
} catch (error) {
  if (error instanceof SecurityError) {
    // SQL injection attempt or blocked query pattern
    console.error('Security violation:', error.message);
  } else if (error instanceof ConnectionError) {
    // Database unreachable or auth failed
    console.error('Connection failed:', error.message);
  } else if (error instanceof TimeoutError) {
    // Query or connection took too long
    console.error('Timeout:', error.message);
  } else if (error instanceof QueryError) {
    // Table not found, syntax error, etc.
    console.error('Query error:', error.message);
  } else if (error instanceof ConfigurationError) {
    // Missing required config, invalid values
    console.error('Config error:', error.message);
  } else if (error instanceof MonitoringError) {
    // Check-specific failure
    console.error('Monitoring error:', error.message);
  }
}
```

## Error properties

All `FreshGuardError` instances include:

| Property | Type | Description |
|---|---|---|
| `message` | `string` | Sanitized error message |
| `code` | `string` | Machine-readable code (e.g. `SECURITY_VIOLATION`, `CONNECTION_FAILED`) |
| `timestamp` | `Date` | When the error occurred |
| `sanitized` | `boolean` | Whether the message is safe for end-user display |

## Error factory

Create errors programmatically:

```typescript
import { createError } from '@freshguard/freshguard-core';

const error = createError('CONNECTION_FAILED', 'Database host unreachable');
```

## Error handler

The `ErrorHandler` utility maps raw database errors to the appropriate `FreshGuardError` subclass with sanitized messages:

```typescript
import { ErrorHandler } from '@freshguard/freshguard-core';

try {
  await connector.executeQuery(sql);
} catch (rawError) {
  throw ErrorHandler.handle(rawError);
}
```

## Logging errors

All errors serialize cleanly to JSON via `toJSON()`:

```typescript
catch (error) {
  if (error instanceof FreshGuardError) {
    logger.error(error.toJSON());
    // { code: "TIMEOUT", message: "Query timeout", timestamp: "...", sanitized: true }
  }
}
```
