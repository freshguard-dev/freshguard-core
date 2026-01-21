# Architecture & Compliance: Data Pipeline Observability Service

This document covers the technical architecture you'd build and the GDPR/compliance considerations that will come up immediately when talking to customers (especially EU-based ones).

---

## Part 1: Service Architecture

### High-Level System Design

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  SvelteKit App (Vercel)                                    │  │
│  │  - Dashboard (data sources, rules, alerts)                 │  │
│  │  - Rule creation/editing UI                               │  │
│  │  - Alert history viewing                                  │  │
│  │  - Team management                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ↕ (HTTPS)
┌──────────────────────────────────────────────────────────────────┐
│                         API LAYER                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Hono on Cloudflare Workers (Distributed globally)         │  │
│  │  - Auth endpoints (GitHub OAuth)                           │  │
│  │  - Source management (CRUD)                               │  │
│  │  - Rule management (CRUD)                                 │  │
│  │  - Alert endpoints (receive + dispatch)                   │  │
│  │  - Webhook handlers (Slack, email, PagerDuty)             │  │
│  │  - Query builder for monitoring (generates SQL)           │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Neon PostgreSQL (Serverless)                              │  │
│  │  - User & workspace data                                  │  │
│  │  - Source credentials (encrypted)                         │  │
│  │  - Rule configurations                                    │  │
│  │  - Check execution history                                │  │
│  │  - Alert audit log                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                  MONITORING JOB SCHEDULER                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  node-schedule (embedded in API, runs every 5 minutes)    │  │
│  │  - Poll configured rules                                  │  │
│  │  - Execute monitoring checks (query customer DB)          │  │
│  │  - Compare against thresholds                             │  │
│  │  - Generate alerts if needed                              │  │
│  │  - Dispatch to Slack/email/PagerDuty                      │  │
│  │  - Store execution record                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                    CUSTOMER DATA SOURCES                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Customer Databases (YOU DO NOT STORE THEIR DATA)          │  │
│  │  - PostgreSQL / MySQL                                      │  │
│  │  - DuckDB                                                 │  │
│  │  - S3 / Parquet (your service reads metadata only)        │  │
│  │  - Snowflake, BigQuery (future)                           │  │
│  │                                                            │  │
│  │  Key point: You execute queries, read results (counts,    │  │
│  │  timestamps), then DISCARD the data. You never store      │  │
│  │  customer data.                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow (Concrete Example)

**Scenario**: FinTech startup configured monitoring for `transactions` table (BigQuery).

**Step 1: Rule Execution (Every 5 minutes)**
```
Cron job runs at 2:00 PM UTC
├─ Query Neon: "Get all active rules"
├─ Find: Rule ID 42 (FinTech's transactions freshness check)
│  ├─ Rule: Table=transactions, Expected=hourly, Tolerance=10 min
│  ├─ Source: BigQuery (API credentials encrypted in Neon)
│
├─ Decrypt credentials (using KMS-like service or Doppler)
├─ Connect to BigQuery using customer's service account
│
├─ Execute query:
│  SELECT 
│    COUNT(*) as row_count,
│    MAX(updated_at) as last_update
│  FROM transactions
│  (Query runs in customer's BigQuery project, not yours)
│
├─ Receive results: { row_count: 1245, last_update: "2026-01-19 13:58:00" }
│
├─ Calculate lag: NOW() - last_update = 2 minutes
│  (Within tolerance of 10 minutes)
│
├─ Result: OK - store execution record in Neon
│  (Record: rule_id=42, status=OK, lag=2min, checked_at=2:00 PM)
│
└─ (No alert sent, still OK)

3 hours later...

Cron job runs at 5:00 PM UTC
├─ Execute same query on BigQuery
├─ Receive results: { row_count: 1245, last_update: "2026-01-19 13:58:00" }
│  (SAME timestamp—no new data arrived!)
├─ Calculate lag: NOW() - last_update = 3 hours 2 minutes
│  (EXCEEDS tolerance of 10 minutes!)
│
├─ Alert triggered: FRESHNESS_BREACH
├─ Store execution record: status=ALERT_PENDING
│
├─ Dispatch alert to Slack:
│  "⚠️ FinTech Data Alert: transactions table hasn't updated in 3h 2m"
│  (Plus: Query button to investigate, suggest actions)
│
├─ Update execution record: status=ALERT_SENT
│
└─ Log to Neon audit trail (timestamp, rule, alert type, recipient)
```

**Key point**: At NO point do you store the actual `transactions` data. You only:
- Execute a query YOU generate
- Read the result (2 numbers: count + timestamp)
- Store the *metadata* of the check (not the data itself)

---

### Database Schema (What You Actually Store)

```sql
-- Users and auth
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  github_id VARCHAR,
  created_at TIMESTAMP
);

-- Workspaces (multi-tenant isolation)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP
);

-- Team members
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR (admin, member)
);

-- Data sources (customer's databases)
CREATE TABLE data_sources (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR,
  type VARCHAR (postgres, duckdb, bigquery, snowflake),
  -- Credentials stored encrypted via Doppler
  -- We DON'T store password here unencrypted
  encrypted_credentials TEXT, -- encrypted blob
  credentials_key_id VARCHAR, -- which KMS key
  is_active BOOLEAN,
  last_tested_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Monitoring rules
CREATE TABLE monitoring_rules (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  source_id UUID REFERENCES data_sources(id),
  name VARCHAR,
  table_name VARCHAR,
  rule_type VARCHAR (freshness, volume_anomaly, schema_change),
  
  -- For freshness
  expected_frequency VARCHAR (hourly, daily, weekly),
  tolerance_minutes INTEGER,
  
  -- For volume anomaly
  baseline_window_days INTEGER,
  deviation_threshold_percent INTEGER,
  
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Alert rules (where to send alerts)
CREATE TABLE alert_destinations (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES monitoring_rules(id),
  destination_type VARCHAR (slack, email, pagerduty),
  destination_address VARCHAR, -- Slack channel, email, PagerDuty key
  severity_level VARCHAR (critical, high, medium, low),
  is_active BOOLEAN
);

-- Check execution history (audit trail)
CREATE TABLE check_executions (
  id UUID PRIMARY KEY,
  rule_id UUID REFERENCES monitoring_rules(id),
  source_id UUID REFERENCES data_sources(id),
  
  -- Execution metadata
  status VARCHAR (ok, alert, failed),
  error_message TEXT, -- if it failed
  
  -- Results (NOT customer data)
  row_count BIGINT,
  last_update TIMESTAMP,
  lag_minutes INTEGER,
  baseline_average NUMERIC,
  deviation_percent NUMERIC,
  
  executed_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Alert dispatch log (audit trail)
CREATE TABLE alert_log (
  id UUID PRIMARY KEY,
  execution_id UUID REFERENCES check_executions(id),
  destination_type VARCHAR,
  destination_address VARCHAR,
  alert_severity VARCHAR,
  
  status VARCHAR (sent, failed, retrying),
  error TEXT,
  
  sent_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Workspace activity log (for compliance audits)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES users(id),
  
  action VARCHAR (source_added, rule_created, alert_sent, etc),
  target_type VARCHAR (source, rule, alert),
  target_id VARCHAR,
  
  details JSONB, -- What changed
  
  created_at TIMESTAMP
);
```

**Critical design choices**:
1. **You never store customer's actual data** (no `transactions` data, no `user_id` values, nothing)
2. **Credentials are encrypted** (in transit and at rest)
3. **Everything is auditable** (who did what, when)
4. **Workspace isolation** (customer A cannot see customer B's rules or history)

---

### Credential Encryption Strategy

You have two options:

#### Option A: Doppler (Managed Secrets, Recommended)

**How it works**:
```typescript
// At signup/add source, customer provides credentials
POST /api/sources
{
  "name": "Production Database",
  "type": "postgres",
  "host": "prod.db.example.com",
  "port": 5432,
  "database": "analytics",
  "username": "read_user",
  "password": "secret123"
}

// Your backend:
// 1. Validate connection works
// 2. Store in Doppler (their API handles encryption)
const doppler = new DopplerClient(process.env.DOPPLER_API_KEY);
await doppler.store(`source-${sourceId}`, JSON.stringify({
  host, port, database, username, password
}));
// 3. In Neon, store only: { sourceId, doppler_secret_name }
// 4. Never store password in Neon
```

**Advantages**:
- ✅ Industry-standard secrets management
- ✅ Automatic encryption/decryption
- ✅ Audit trail of who accessed secrets
- ✅ Easy credential rotation
- ✅ Compliance-friendly (GDPR, SOC2)

**Cost**: ~$50-100/month (handles 100+ secrets)

#### Option B: In-Database Encryption (DIY, More Work)

```typescript
// At signup, you encrypt credentials before storing
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const encryptionKey = process.env.DATA_ENCRYPTION_KEY; // 32-byte key from env

function encryptCredentials(creds: object): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey), iv);
  
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(creds), 'utf-8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Store: iv + authTag + encrypted (as single blob)
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decryptCredentials(blob: string): object {
  const buffer = Buffer.from(blob, 'base64');
  
  const iv = buffer.slice(0, 16);
  const authTag = buffer.slice(16, 32);
  const encrypted = buffer.slice(32);
  
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey), iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  return JSON.parse(decrypted.toString('utf-8'));
}

// In Neon:
const query = `
  INSERT INTO data_sources (workspace_id, name, type, encrypted_credentials)
  VALUES ($1, $2, $3, $4)
`;
await db.query(query, [workspaceId, name, type, encryptedBlob]);
```

**Advantages**:
- ✅ No external dependencies (cheaper)
- ✅ Full control
- ✅ Works offline

**Disadvantages**:
- ❌ You manage the encryption key (high responsibility)
- ❌ No audit trail of who accessed what
- ❌ Harder to rotate credentials
- ❌ More security risk (key stored in env vars)

**My recommendation**: Use Doppler for MVP. You're adding ~$50/month cost, but you eliminate a whole class of security bugs and compliance headaches. At $6-10k/month revenue, that's 0.5-1% cost—negligible.

---

### Monitoring Job Architecture

The scheduler that runs checks every 5 minutes:

```typescript
// scheduler.ts - embedded in your Cloudflare Worker

import { CronRequest } from 'cloudflare-workers-types';

export async function handleCron(request: CronRequest) {
  // This runs via Cloudflare Cron Trigger every 5 minutes
  
  const db = getDatabase(); // Neon connection
  
  // Get all active rules
  const rules = await db.query(`
    SELECT r.*, s.type, s.encrypted_credentials
    FROM monitoring_rules r
    JOIN data_sources s ON r.source_id = s.id
    WHERE r.is_active = true
  `);
  
  for (const rule of rules) {
    try {
      // Execute the check
      const result = await executeCheck(rule);
      
      // Store execution result
      await db.query(`
        INSERT INTO check_executions 
        (rule_id, status, row_count, last_update, lag_minutes, executed_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [rule.id, result.status, result.rowCount, result.lastUpdate, result.lagMinutes]);
      
      // If alert needed, dispatch it
      if (result.status === 'alert') {
        await dispatchAlert(rule, result);
      }
      
    } catch (error) {
      // Log the error
      await db.query(`
        INSERT INTO check_executions
        (rule_id, status, error_message, executed_at)
        VALUES ($1, 'failed', $2, NOW())
      `, [rule.id, error.message]);
      
      // Don't throw—other rules should still run
      console.error(`Check failed for rule ${rule.id}:`, error);
    }
  }
  
  return { success: true, checksRun: rules.length };
}

async function executeCheck(rule: Rule): Promise<CheckResult> {
  if (rule.rule_type === 'freshness') {
    return await checkFreshness(rule);
  } else if (rule.rule_type === 'volume_anomaly') {
    return await checkVolume(rule);
  }
}

async function checkFreshness(rule: Rule): Promise<CheckResult> {
  // Decrypt credentials
  const creds = await decryptFromDoppler(rule.encrypted_credentials);
  
  // Connect to customer's database
  const connection = await createConnection(rule.source_type, creds);
  
  try {
    // Execute monitoring query
    const result = await connection.query(`
      SELECT 
        COUNT(*) as row_count,
        MAX(updated_at) as last_update
      FROM ${rule.table_name}
    `);
    
    const { row_count, last_update } = result.rows[0];
    const lagMinutes = (Date.now() - last_update.getTime()) / 60000;
    
    const status = lagMinutes > rule.tolerance_minutes ? 'alert' : 'ok';
    
    return {
      status,
      rowCount: row_count,
      lastUpdate: last_update,
      lagMinutes: Math.round(lagMinutes)
    };
    
  } finally {
    await connection.close();
  }
}

async function dispatchAlert(rule: Rule, result: CheckResult) {
  // Get alert destinations for this rule
  const destinations = await db.query(`
    SELECT * FROM alert_destinations
    WHERE rule_id = $1 AND is_active = true
  `, [rule.id]);
  
  for (const dest of destinations) {
    if (dest.destination_type === 'slack') {
      await sendSlackAlert(dest.destination_address, rule, result);
    } else if (dest.destination_type === 'email') {
      await sendEmailAlert(dest.destination_address, rule, result);
    } else if (dest.destination_type === 'pagerduty') {
      await sendPagerDutyAlert(dest.destination_address, rule, result);
    }
    
    // Log dispatch
    await db.query(`
      INSERT INTO alert_log (destination_type, destination_address, status)
      VALUES ($1, $2, 'sent')
    `, [dest.destination_type, dest.destination_address]);
  }
}
```

**Key design points**:
1. **Cron-based, not queue-based** (no Redis needed)
2. **Fail gracefully** (if one check fails, others still run)
3. **Close connections properly** (prevent leaks)
4. **Log everything** (audit trail)
5. **Stateless** (runs on Cloudflare Workers, scales automatically)

---

## Part 2: GDPR & Compliance

Now the part that will come up in every sales conversation with EU customers.

### The Core GDPR Question

**Customer will ask**: "You're connecting to our database. What data do you see? Do you store it? How is it protected?"

**Your answer framework**:

---

### What Data You See

```
Your service ONLY reads metadata about their data:

❌ You do NOT see:
  - Actual customer data (names, emails, PII)
  - User IDs, transaction details, order contents
  - Any actual business data

✅ You DO see (metadata only):
  - Table name: "transactions"
  - Row count: 1,245,000
  - Last update timestamp: "2026-01-19 13:58:00 UTC"
  - Column names (for schema detection, Phase 2)
  - (That's literally all)

Think of it like:
  ❌ Not: "Reading every order in your database"
  ✅ Yes: "Knowing your orders table has 1.2M rows and was last updated 2 hours ago"
```

**Concrete example query you execute**:

```sql
-- You run this query:
SELECT 
  COUNT(*) as row_count,
  MAX(updated_at) as last_update
FROM transactions;

-- You receive this result:
{ row_count: 1245000, last_update: "2026-01-19 13:58:00" }

-- You immediately forget the data
-- You store only:
{ 
  ruleId: 42,
  checkTime: "2026-01-19 15:58:00",
  rowCount: 1245000,
  lastUpdate: "2026-01-19 13:58:00",
  lagMinutes: 120
}
```

---

### GDPR Compliance Strategy

GDPR has two main concerns for you:

#### Concern 1: Data Processing (You're a Processor)

**What GDPR says**:
If you access customer data (even metadata), you're a "data processor." You need a Data Processing Agreement (DPA).

**Your position**:
"We don't store personal data, but we access your database. To be fully compliant, we should have a DPA."

**DPA Template** (European Court standard):
```
Data Processing Addendum (DPA)

1. Scope of Processing
   - Service Provider shall process only the metadata required to monitor 
     data freshness and volume (row counts, timestamps, schema).
   - Service Provider shall NOT access, store, or process personal data 
     or business data.

2. Data Subject Rights
   - Service Provider shall not prevent Customer from honoring data subject 
     rights (access, deletion, portability).
   - Service Provider shall not store personal data, so deletion requests 
     are not affected by our service.

3. Security Measures
   - Credentials are encrypted (AES-256-GCM or equivalent)
   - Credentials stored in encrypted secrets vault (Doppler)
   - All data in transit is HTTPS/TLS 1.2+
   - Database access is read-only and restricted to metadata queries
   - Regular security audits (annual)

4. Subprocessors
   - Doppler: Secrets management
   - Neon: Database hosting
   - Slack/Sendgrid: Alert delivery (optional)
   - Cloudflare: API hosting
   - Customer is notified if subprocessors change

5. Data Retention
   - Execution history (check results, alerts) retained for 90 days
   - After 90 days, automatically deleted
   - Customer can request earlier deletion

6. Data Breach
   - In event of breach, Customer notified within 72 hours
   - Service Provider will assist with GDPR notification

7. Term & Deletion
   - Upon account deletion, all data (rules, execution history, credentials) 
     are permanently deleted
```

**Cost**: You can use a template (~$0) or hire lawyer (~$500-1000 to customize)

#### Concern 2: Cross-Border Data Transfer (EU to US?)

**The issue**: If your service is hosted in the US, transferring EU data to US violates GDPR (unless certified).

**Your solution** (choose one):

**Option A: Host in EU** (simplest for EU customers)
```
- Use Neon with EU region (Frankfurt, available)
- Use Cloudflare EU-only (available)
- Use Doppler with EU data residency (available)
- Result: All data stays in EU, no GDPR transfer issues
```

**Option B: Use Standard Contractual Clauses** (more complex)
```
- Add clause to DPA: "Data transfer is covered by Standard Contractual Clauses"
- Acknowledge Schrems II ruling
- Accept that "transfer risk exists" but mitigated by contractual terms
- Many US SaaS companies use this (Stripe, Twilio, etc.)
```

**Option C: Privacy Shield Alternative** (not viable yet)
```
- Wait for EU-US adequacy decision (unlikely before 2027)
- Not an option right now
```

**My recommendation**: Use **Option A** (EU hosting) for MVP. It's the cleanest and most defensible. Cost is minimal:

```
- Neon EU region: Same price ($100/month)
- Cloudflare EU: Same price ($50/month)
- Doppler EU: Same price ($50/month)
- Total cost difference: $0 (same as US)
```

Setting this up takes 30 minutes.

---

### Data Retention & Deletion

GDPR says: "Keep data only as long as needed."

**Your policy**:

```
Retention Schedule:

1. User account data: Retained for account lifetime
   - Email, name, workspace, team members
   - Deleted when account is deleted

2. Data source credentials: Retained while rule is active
   - Encrypted in Doppler
   - Deleted when source is deleted
   - Never accessible in plaintext

3. Monitoring rule configurations: Retained for account lifetime
   - Deleted when rule is deleted
   - Deleted when account is deleted

4. Check execution results: Retained for 90 days
   - Row counts, timestamps, lag metrics
   - Historical audit trail
   - After 90 days: Automatically deleted
   - Customer can request deletion anytime (API endpoint)

5. Alert dispatch log: Retained for 90 days
   - Which alerts were sent, to where, when
   - Audit trail for support troubleshooting
   - After 90 days: Automatically deleted

6. Audit log (compliance): Retained for 3 years
   - Who created/modified rules
   - Legal obligation in EU
   - Not accessible to customers
   - Kept separate from operational data
```

**Implementation**:

```typescript
// Daily cleanup job
export async function handleDailyCleanup() {
  const db = getDatabase();
  
  // Delete execution history older than 90 days
  await db.query(`
    DELETE FROM check_executions
    WHERE executed_at < NOW() - INTERVAL '90 days'
  `);
  
  // Delete alert logs older than 90 days
  await db.query(`
    DELETE FROM alert_log
    WHERE sent_at < NOW() - INTERVAL '90 days'
  `);
  
  // Note: Don't delete audit logs (legal requirement)
}

// When customer deletes account
export async function deleteWorkspace(workspaceId: string) {
  const db = getDatabase();
  
  // Get all sources and delete credentials
  const sources = await db.query(`
    SELECT id, encrypted_credentials FROM data_sources
    WHERE workspace_id = $1
  `, [workspaceId]);
  
  for (const source of sources) {
    // Delete from Doppler
    await doppler.delete(`source-${source.id}`);
  }
  
  // Delete everything else
  await db.query(`
    DELETE FROM monitoring_rules WHERE workspace_id = $1
  `, [workspaceId]);
  
  await db.query(`
    DELETE FROM data_sources WHERE workspace_id = $1
  `, [workspaceId]);
  
  await db.query(`
    DELETE FROM check_executions 
    WHERE source_id IN (SELECT id FROM data_sources WHERE workspace_id = $1)
  `, [workspaceId]);
  
  await db.query(`
    DELETE FROM workspaces WHERE id = $1
  `, [workspaceId]);
  
  // Keep audit logs (legal requirement)
}
```

---

### Privacy Policy & Terms of Service

You'll need these documents. You can use templates:

**Privacy Policy Template** (key sections):

```markdown
# Privacy Policy

## What data do we collect?
- Account information: Email, name, workspace name
- Configuration data: Data source connections, monitoring rules
- Metadata: Row counts, timestamps from your databases
- Audit logs: Who created/modified rules, when

## What data do we NOT collect?
- We do NOT access, store, or process personal data from your databases
- We do NOT see the contents of your tables
- We read only aggregated metadata (counts and timestamps)

## How do we protect your data?
- Credentials: Encrypted with AES-256-GCM
- In transit: HTTPS/TLS 1.2+
- At rest: PostgreSQL encryption, access controls
- Access: Read-only to your databases

## Data retention
- Check results: 90 days
- Alerts: 90 days
- Audit logs: 3 years (legal requirement)
- Credentials: Deleted when you delete source or account

## Your rights (GDPR)
- Access: You can download all your data
- Deletion: You can delete your account anytime
- Portability: You can export your rules
- We will comply with GDPR requests within 30 days

## DPA
- We have a standard Data Processing Addendum available
- EU customers: We host data in EU (Frankfurt)
```

You can use Termly, iubenda, or similar to generate these. Cost: $0-50/year.

---

### What to Tell Customers

**In your sales pitch to EU customers**:

> "We take GDPR seriously. Here's what you need to know:
> 
> 1. **We don't store your data.** We only read metadata (table size, last update time). That's literally it.
> 
> 2. **Your credentials are encrypted.** We use industry-standard AES-256 encryption and Doppler secrets management.
> 
> 3. **You control the access.** The credentials are yours; you give us read-only access. You can revoke anytime.
> 
> 4. **Your data stays in EU.** We host everything in Frankfurt (EU region).
> 
> 5. **We have a DPA.** We're a data processor under GDPR. Here's our standard DPA [link].
> 
> 6. **Data is deleted automatically.** After 90 days, check history is gone. When you delete your account, everything is gone (except audit logs we're required to keep).
> 
> 7. **You own your data.** You can export or delete rules anytime via API.
> 
> Any specific concerns about how we handle your data? Let's discuss."

---

### Security Checklist (for your own ops)

Things you should do to be responsible:

```
Authentication & Access:
☐ GitHub OAuth only (no password storage)
☐ Session tokens with 7-day expiry
☐ Enforce HTTPS everywhere
☐ CORS policy (no open endpoints)

Encryption:
☐ Credentials encrypted before storage (Doppler or at-rest encryption)
☐ All API traffic over HTTPS/TLS 1.2+
☐ Database passwords in environment variables (never in code)
☐ Encryption key rotated annually

Database Security:
☐ PostgreSQL connection uses SSL
☐ Database user has minimal permissions (SELECT only)
☐ Row-level security (workspace isolation)
☐ Regular backups (automated, tested)

Monitoring:
☐ Error tracking (Sentry)
☐ Uptime monitoring
☐ Failed login attempts (alert after 5 attempts)
☐ Unusual data access patterns (alert)

Compliance:
☐ Privacy policy (template-based)
☐ Terms of Service (template-based)
☐ DPA ready (use standard EU template)
☐ Data retention policy implemented
☐ Right to deletion implemented (API endpoint)

Incident Response:
☐ Security contact email (security@yourservice.com)
☐ Breach notification process (72-hour commitment)
☐ Incident log (who accessed what, when)
☐ Incident response plan (document)

Third-party:
☐ Doppler SOC 2 certified (yes)
☐ Neon SOC 2 certified (yes)
☐ Cloudflare SOC 2 certified (yes)
☐ Verify subprocessor terms annually
```

---

### When GDPR Concerns Are Just FUD

Some customers will have unreasonable GDPR concerns:

**Customer**: "We can't use a tool that touches our database."

**Reality**: If you're monitoring freshness, you have to query the database. That's the entire product.

**Your response**: "Right, we do read metadata. That's unavoidable. But we encrypt your credentials, don't store your data, and comply with GDPR. This is standard for any monitoring tool (Datadog, New Relic, etc. all do this). Are you concerned about a specific aspect?"
