# Security Policy

## Reporting Security Vulnerabilities

We take security seriously and appreciate your efforts to responsibly disclose security vulnerabilities.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing: **security@freshguard.dev**

Include the following information in your report:
- Type of vulnerability (e.g., SQL injection, path traversal, etc.)
- Location of the affected source code (file path and line number)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact assessment (what an attacker could achieve)

### Response Timeline

- **Initial Response**: Within 48 hours of receiving your report
- **Status Update**: Within 7 days with preliminary assessment
- **Resolution**: Security vulnerabilities will be addressed within 30 days for critical issues, 90 days for other issues

### What to Expect

1. We will acknowledge receipt of your vulnerability report
2. We will investigate and validate the vulnerability
3. We will work on a fix and coordinate disclosure timeline with you
4. We will credit you in the security advisory (unless you prefer to remain anonymous)
5. We will publish a security advisory with details after the fix is released

## Supported Versions

Security updates are provided for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.11.x  | :white_check_mark: |
| 0.10.x  | :white_check_mark: |
| < 0.10  | :x:                |

## Threat Model

### Overview

FreshGuard Core is a read-only data pipeline monitoring engine designed for self-hosting. The threat model considers attacks against the monitoring infrastructure and the data sources it connects to.

### Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│ EXTERNAL ENVIRONMENT (Untrusted)                           │
├─────────────────────────────────────────────────────────────┤
│ • Configuration Files (.env, config.json)                  │
│ • Command Line Arguments                                    │
│ • Environment Variables                                     │
│ • Network Connections                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FRESHGUARD CORE (Partially Trusted)                        │
├─────────────────────────────────────────────────────────────┤
│ • Input Validation Layer                                    │
│ • Query Analysis Engine                                     │
│ • Database Connectors                                       │
│ • Monitoring Algorithms                                     │
│ • Error Handling & Sanitization                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ DATA SOURCES (Trusted - Database Credentials Required)     │
├─────────────────────────────────────────────────────────────┤
│ • PostgreSQL                                                │
│ • DuckDB Files                                              │
│ • BigQuery                                                  │
│ • Snowflake                                                 │
│ • MySQL                                                     │
│ • Redshift                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Attack Vectors & Threat Categories

#### 1. Input-Based Attacks (HIGH PRIORITY)

**Threat**: Malicious input leading to code execution or data access
**Attack Vectors**:
- SQL injection through table names or configuration
- Path traversal through DuckDB file paths
- Command injection through CLI arguments
- Configuration injection through environment variables

**Mitigations in Place**:
- ✅ Multi-layer input validation using Zod schemas
- ✅ SQL identifier escaping with strict regex `^[a-zA-Z0-9_\.]+$`
- ✅ Blocked SQL keywords detection (30+ dangerous terms)
- ✅ Path traversal prevention for DuckDB files
- ✅ CLI command whitelist validation
- ✅ Advanced SQL query analysis with risk scoring

**Residual Risks**:
- Sophisticated SQL injection bypassing heuristic detection
- Novel path traversal techniques not covered by current patterns

#### 2. Network-Based Attacks (MEDIUM PRIORITY)

**Threat**: Attacks against database connections and network traffic
**Attack Vectors**:
- Man-in-the-middle attacks on database connections
- DNS poisoning to redirect connections
- Network sniffing of credentials
- SSL/TLS downgrade attacks

**Mitigations in Place**:
- ✅ SSL/TLS enforcement with `rejectUnauthorized: true`
- ✅ Connection timeouts (30s) and query timeouts (10s)
- ✅ Single connection pool per connector (attack surface reduction)
- ✅ No credential logging or error message exposure

**Residual Risks**:
- Weak SSL configurations on target databases
- Network-level attacks outside FreshGuard's control

#### 3. Resource Exhaustion (MEDIUM PRIORITY)

**Threat**: Denial of service through resource consumption
**Attack Vectors**:
- Large result set attacks consuming memory
- Complex queries causing CPU exhaustion
- Connection flooding
- Disk space exhaustion through logging

**Mitigations in Place**:
- ✅ Result size limits (default 1000 rows)
- ✅ Query timeout enforcement (10s default)
- ✅ Connection timeout enforcement (30s default)
- ✅ Limited connection pools (max: 1 per connector)
- ✅ Query complexity analysis and warnings

**Residual Risks**:
- Resource exhaustion at database level
- Memory leaks in long-running processes

#### 4. Configuration-Based Attacks (MEDIUM PRIORITY)

**Threat**: Attacks through malicious configuration
**Attack Vectors**:
- Malicious database connection strings
- Path traversal through configuration file paths
- Environment variable injection
- Credential theft through configuration exposure

**Mitigations in Place**:
- ✅ Configuration path validation (restricted directories)
- ✅ Connection string sanitization
- ✅ Environment variable-based credential handling
- ✅ No credential logging or debug exposure
- ✅ Production environment detection for error sanitization

**Residual Risks**:
- Social engineering for configuration access
- Insufficient file system permissions on configuration

#### 5. Supply Chain Attacks (LOW PRIORITY)

**Threat**: Compromised dependencies or build process
**Attack Vectors**:
- Malicious npm packages in dependency tree
- Compromised build environment
- Code injection through automated processes
- Typosquatting attacks

**Mitigations in Place**:
- ✅ Dependency auditing with `pnpm audit`
- ✅ SBOM generation (SPDX & CycloneDX)
- ✅ Vulnerability scanning with Grype
- ✅ Package signing with cosign (keyless OIDC)
- ✅ Malicious pattern detection in CI/CD
- ✅ Frozen lockfiles in production

**Residual Risks**:
- Zero-day vulnerabilities in dependencies
- Sophisticated supply chain compromises

#### 6. Information Disclosure (LOW PRIORITY)

**Threat**: Sensitive information exposure
**Attack Vectors**:
- Database schema information leakage
- Connection string exposure in errors
- Credential exposure in logs
- Internal system information disclosure

**Mitigations in Place**:
- ✅ Error message sanitization in production
- ✅ Debug mode controls (`NODE_ENV` based)
- ✅ No credential logging
- ✅ Structured logging with context filtering
- ✅ Read-only operations (no data modification)

**Residual Risks**:
- Schema inference through monitoring patterns
- Timing attacks revealing system information

### Out of Scope

The following are explicitly **out of scope** for FreshGuard Core security:

❌ **Multi-tenant security** (handled by cloud wrapper)
❌ **User authentication/authorization** (delegated to self-hosters)
❌ **Database security** (responsibility of database administrators)
❌ **Infrastructure security** (responsibility of deployment environment)
❌ **Network security** (responsibility of network administrators)
❌ **Operating system security** (responsibility of system administrators)

## Security Architecture

### Defense in Depth Strategy

FreshGuard Core implements multiple security layers:

```
External Input
       ↓
┌─────────────────┐
│ Input Validation│  ← Zod schemas, format validation
├─────────────────┤
│ Query Analysis  │  ← SQL injection detection, complexity analysis
├─────────────────┤
│ Connection Layer│  ← SSL enforcement, timeouts, connection limits
├─────────────────┤
│ Database Driver │  ← Parameterized queries, read-only operations
├─────────────────┤
│ Error Handling  │  ← Information disclosure prevention
└─────────────────┘
       ↓
Database/Results
```

### Security Components

#### 1. Input Validation Layer (`src/validation/`)
- **Purpose**: First line of defense against malicious input
- **Components**: Zod schemas, sanitizers, pattern detection
- **Coverage**: Table names, connection configs, file paths, CLI arguments

#### 2. Query Analysis Engine (`src/security/query-analyzer.ts`)
- **Purpose**: Advanced SQL security analysis
- **Features**: Risk scoring (0-100), injection detection, complexity analysis
- **Configuration**: Strict/Default/Performance-focused policies

#### 3. Base Connector Security (`src/connectors/base-connector.ts`)
- **Purpose**: Enforced security for all database connections
- **Features**: Identifier escaping, timeout enforcement, result limits
- **Design**: Abstract base class ensuring consistent security

#### 4. Error Sanitization (`src/errors/`)
- **Purpose**: Prevent information disclosure through error messages
- **Features**: Production-safe messages, debug controls, context filtering
- **Coverage**: Database errors, connection failures, validation errors

### Security Configuration

#### Environment Variables (Required)
```bash
NODE_ENV=production              # Enables error sanitization
LOG_LEVEL=warn                   # Reduces log verbosity
REQUIRE_SSL=true                 # Enforces SSL connections
FRESHGUARD_DEBUG=false           # Disables debug features
```

#### Connection Security Settings
```bash
CONNECTION_TIMEOUT=30            # Connection timeout (seconds)
QUERY_TIMEOUT=10                 # Query timeout (seconds)
MAX_ROWS=1000                    # Maximum result set size
SSL_REJECT_UNAUTHORIZED=true     # Strict SSL validation
```

## Security Best Practices

### For Self-Hosters

#### Database Security
1. **Use dedicated read-only accounts** for FreshGuard connections
2. **Enable SSL/TLS** for all database connections
3. **Limit network access** using firewall rules or VPCs
4. **Grant minimal permissions** (SELECT only on required tables)
5. **Monitor database logs** for unusual query patterns
6. **Rotate credentials regularly** (recommended: 90 days)

#### Deployment Security
1. **Use environment variables** for credentials (never hardcode)
2. **Set `NODE_ENV=production`** for error sanitization
3. **Enable audit logging** and monitor for security events
4. **Keep dependencies updated** using `pnpm audit`
5. **Use non-root user** for running FreshGuard processes
6. **Implement log rotation** to prevent disk exhaustion

#### Network Security
1. **Use private networks** for database connections when possible
2. **Implement network segmentation** between monitoring and production
3. **Use VPN or bastion hosts** for remote database access
4. **Monitor network traffic** for unusual patterns
5. **Enable database connection encryption**

#### Configuration Security
1. **Store configuration files** in protected directories (600 permissions)
2. **Use configuration management tools** (Ansible, Terraform) for consistency
3. **Validate configuration changes** before deployment
4. **Back up configurations securely** with encryption
5. **Implement configuration drift detection**

### For Developers

#### Secure Development
1. **Run security tests** before committing: `pnpm test:security`
2. **Update dependencies regularly**: `pnpm audit && pnpm update`
3. **Use type safety**: Enable strict TypeScript mode
4. **Validate all inputs**: Use Zod schemas for new input types
5. **Follow least privilege**: Grant minimal permissions for new features

#### Code Review Checklist
- [ ] All inputs validated with appropriate schemas
- [ ] Database queries use parameterized statements or proper escaping
- [ ] Error messages don't expose sensitive information
- [ ] Timeouts implemented for external operations
- [ ] SSL/TLS enforced for network connections
- [ ] Tests cover security edge cases
- [ ] Documentation updated for security implications

#### Testing Security
```bash
# Run security-focused tests
pnpm test:security               # Security test suite
pnpm test:sql-injection          # SQL injection tests
pnpm test:path-traversal         # Path traversal tests
pnpm audit                       # Dependency vulnerabilities
pnpm run security-scan           # Static analysis
```

## Incident Response

### Security Incident Classification

**Critical (P0)**: Remote code execution, credential theft, data exfiltration
- Response time: Immediate (< 4 hours)
- Fix timeline: 24-48 hours
- Communication: Public advisory within 48 hours

**High (P1)**: Authentication bypass, privilege escalation, significant DoS
- Response time: 24 hours
- Fix timeline: 1 week
- Communication: Public advisory within 1 week

**Medium (P2)**: Information disclosure, limited DoS, configuration vulnerabilities
- Response time: 72 hours
- Fix timeline: 2 weeks
- Communication: Fix in next release

**Low (P3)**: Minor information leakage, best practice violations
- Response time: 1 week
- Fix timeline: Next major release
- Communication: Fix notes in release

### Emergency Contacts

**Security Team**: security@freshguard.dev
**Project Maintainers**: See CODEOWNERS file
**Emergency Escalation**: Create GitHub issue tagged "security" (for non-sensitive issues only)

## Security Changelog

### Version 0.11.1
- Enhanced SQL query analysis with complexity scoring
- Added path traversal protection for DuckDB connectors
- Improved error sanitization in production mode

### Version 0.10.0
- Implemented comprehensive schema change monitoring
- Added security event logging
- Enhanced connection timeout handling

### Version 0.9.0
- Added query complexity analysis
- Implemented result size limits
- Enhanced SSL/TLS enforcement

## Acknowledgments

We thank the following security researchers for their responsible disclosure:

- *[Future security researchers will be credited here]*

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Advisories](https://www.npmjs.com/advisories)
- [GitHub Security Lab](https://securitylab.github.com/)

---

**Last Updated**: 2026-02-01
**Document Version**: 1.0
**Next Review**: 2026-08-01