# Architecture & Compliance: Executive Summary

You have comprehensive documentation in the other files. This is the TL;DR version for decision-making and implementation planning.

---

## The Technical Architecture (1-Page Version)

Your service has four layers:

### 1. Frontend (SvelteKit on Vercel)
- Dashboard for creating/managing monitoring rules
- Alert history viewing
- Team member management
- Deployment: Push to GitHub → Vercel auto-deploys (very low friction)

### 2. API (Hono on Cloudflare Workers)
- User auth (GitHub OAuth)
- Source/rule management
- The scheduler that runs checks every 5 minutes
- Advantage: Runs globally, no cold starts, pay-per-request

### 3. Database (Neon PostgreSQL)
- Stores everything EXCEPT customer's actual data
- Specifically: Users, rules, encrypted credentials, execution history, audit logs
- Advantage: Serverless, auto-scales, cheap, has EU region available

### 4. Scheduler (node-schedule)
- Every 5 minutes: Check all active rules
- For each rule: Connect to customer's DB, run monitoring query, store result
- If threshold breached: Send alert to Slack/email/PagerDuty
- Advantage: Embedded (no separate job queue infrastructure), simple

**Critical point**: Customer data never comes into your system.

```
Your service:                Customer's database:
├─ User accounts            (You connect here, read metadata only)
├─ Rules/configs            │
├─ Execution results        └─ You execute: SELECT COUNT(*), MAX(updated_at)
├─ Encrypted credentials       └─ You receive: { 1245000, "2026-01-19 13:58:00" }
└─ Audit logs                  └─ You store: metadata of the check (not the data)
                               └─ You forget the actual data immediately
```

---

## The GDPR Compliance Story (What EU Customers Will Ask)

### What You See
```
❌ NOT: "All their data—customer names, transactions, PII"
✅ YES: "Just metadata—'Your orders table has 1.2M rows and was updated 2 hours ago'"
```

### How You Protect It
```
Step 1: Customer gives you credentials (postgres://user:pass@host/db)
Step 2: You validate they work
Step 3: You encrypt them (AES-256-GCM)
Step 4: You store encrypted in Doppler (secrets vault)
Step 5: When you need them: Fetch from Doppler (already encrypted)
Result: Never unencrypted, never logged, never accessible to employees
```

### GDPR Compliance Checklist
```
✅ Data Processing Agreement (DPA): Available, standard EU template
✅ EU Data Residency: Neon, Cloudflare, Doppler all have EU regions
✅ Encryption: Credentials encrypted at rest, HTTPS/TLS 1.2+ in transit
✅ Read-Only Access: You only execute SELECT queries, never modify
✅ Automatic Deletion: 90-day retention, then auto-delete check history
✅ Right to Delete: Customers can delete account, everything gets wiped
✅ Breach Notification: 72-hour commitment if anything happens
```

**Your pitch to EU customers**:
> "We comply with GDPR because we don't access actual data—only metadata. Your credentials are encrypted. We host in EU. We have a standard DPA. Data is deleted automatically after 90 days. You control everything. Questions?"

---

## Credential Encryption Strategy (Two Options)

### Option A: Doppler (Recommended for MVP)
- Cost: $50/month
- Management: Third-party handles encryption/rotation/audit trail
- Compliance: Industry standard, audited, includes breach notification
- **This is the cleanest approach**

### Option B: In-Database (DIY, Save Money)
- Cost: $0 extra (but more risk)
- Management: You manage encryption keys (high responsibility)
- Compliance: You handle everything (more complex)
- **Only if you're very confident in security**

**Recommendation**: Use Doppler for MVP. The $50/month is 0.5% of your projected revenue and eliminates an entire class of security bugs.

---

## Year 1 Cost & Revenue

### Infrastructure Costs
```
Neon PostgreSQL:    $100/month  = $1,200/year
Cloudflare Workers: $50/month   = $600/year
Doppler:            $50/month   = $600/year
Vercel:             $200/month  = $2,400/year
Monitoring/email:   $120/month  = $1,440/year
─────────────────────────────────────────
Total:              $520/month  = $6,240/year
```

### Projected Revenue
```
Months 1-6: 20-40 customers × $150-300/mo = $3,000-12,000/mo
Months 7-12: 50-80 customers × $150-300/mo = $7,500-24,000/mo
─────────────────────────────────────────
Year 1: ~$60,000-100,000
```

### Profit
```
Revenue: $60,000-100,000
Costs:   $6,240 + $2,000 (legal/setup)
Profit:  $52,000-92,000

ROI: 8x-14x in year 1
```

---

## Build Timeline (7 Weeks MVP)

```
Week 1-2: Foundation (auth, database, API scaffold)
Week 2-3: Connectors (PostgreSQL, DuckDB)
Week 3-4: Monitoring logic (freshness + volume checks)
Week 4-5: Alerting (Slack, email integration)
Week 5-6: Frontend dashboard (rule management UI)
Week 6-7: Testing, deployment, documentation
```

**You could realistically start this in February and have customers by late March/April.**

---

## Support Burden Over Time

- **Months 1-3**: 12-22 hrs/month (onboarding + early support)
- **Months 4-6**: 28-32 hrs/month (peak—most customers acquiring)
- **Months 7-12**: 30 hrs/month (stabilizes, plateaus at ~60-80 customers)

**This is manageable at 2-4 hours/week alongside your job.**

---

## The Three Things That Will Come Up in Sales

### 1. "Is this secure?"
Answer: "Yes. Credentials encrypted (AES-256), all traffic HTTPS/TLS, read-only access, automatic deletion after 90 days. Stored in EU if you're EU-based."

### 2. "Are you GDPR compliant?"
Answer: "Yes. We don't access actual data—only metadata. We have a standard DPA. We're a data processor. EU data residency available. Here's our compliance checklist."

### 3. "What if you get hacked?"
Answer: "Credentials are encrypted (useless to hacker without key). We notify you within 72 hours. You can rotate your database password. We help coordinate response."

All three have clear, confident answers based on your architecture.

---

## Key Decisions You Need to Make

1. **EU hosting from day 1?** (Recommended: YES, no cost difference)
2. **Doppler or DIY encryption?** (Recommended: Doppler, $50/month is worth it)
3. **Custom DPA or template?** (Recommended: Template first, customize if needed)
4. **Sentry monitoring?** (Recommended: YES, $100/month for peace of mind)

**Total "recommended" cost: $520/month infrastructure + $50/month legal = $570/month baseline.**

At your projected revenue ($60-100k/year), that's 7-12% of revenue going to ops. Very sustainable.

---

## Security Red Flags to Avoid

### 🚩 Don't Do This: Log Credentials Anywhere
```
❌ Wrong:
console.log(`Connecting with ${password}...`)

✅ Right:
const creds = await decryptFromDoppler();
// Never log creds
```

### 🚩 Don't Do This: Store Customer Data
```
❌ Wrong:
SELECT * FROM transactions;  // Store actual data

✅ Right:
SELECT COUNT(*), MAX(updated_at) FROM transactions;  // Only metadata
```

### 🚩 Don't Do This: Let Different Customers See Each Other's Data
```
❌ Wrong:
SELECT * FROM monitoring_rules;  // All customers

✅ Right:
SELECT * FROM monitoring_rules WHERE workspace_id = $1;  // Only current
```

### 🚩 Don't Do This: Store Unencrypted Credentials
```
❌ Wrong:
INSERT INTO sources (password) VALUES ($1);

✅ Right:
const encrypted = await doppler.encrypt(password);
INSERT INTO sources (encrypted_credentials) VALUES ($1);
```

---

## Going Forward

You now have three detailed documents:

1. **architecture_compliance.md** - Full technical details and GDPR strategy
2. **customer_journeys.md** - Real customer onboarding scenarios
3. **This file** - TL;DR for quick reference

**Use this for**:
- Selling to EU customers: Show GDPR section
- Talking to advisors/investors: Show cost/ROI breakdown
- Planning your build: Use build timeline
- Security review: Use red flags section

---

## Decision Point

Before you start building, confirm:

1. **Can you commit 4-6 weeks to building this?** (Nights/weekends)
2. **Are you comfortable with the security responsibility?**
3. **Do you believe the market opportunity is real?**
4. **Can you maintain this at 2-4 hrs/week once live?**

If all YES → You're ready to build.

---

## Next Steps

1. **Week 1**: Validation (interview 5-10 prospects)
2. **Week 2**: Architecture review (walk through this doc with a friend)
3. **Week 3-4**: Setup development environment
4. **Week 5+**: Build

Good luck.
