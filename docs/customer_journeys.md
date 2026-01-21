# Customer Implementation Journeys: Option B (Pipeline Observability)

For each customer archetype, here's the realistic implementation path—what they'd need to do to get value, how long it takes, what friction points exist, and what support you'd need to provide.

---

## Customer 1: FinTech Startup (Affirm-like BNPL)

### Their Data Stack (Typical)

```
Stripe (payment processor)
    ↓
Fivetran (connector)
    ↓
BigQuery (data warehouse)
    ↓
Looker (dashboarding)
    ↓
Internal alerts (custom Slack bot, poorly maintained)
```

### Their Current Monitoring Reality

- **Manual checks**: Finance analyst queries BigQuery every Friday morning
- **Slack bot**: They have a custom-built one that sends daily transaction counts, but it breaks occasionally
- **Root cause visibility**: Zero. When Fivetran fails, they don't know why without manually checking Fivetran's UI

---

### Implementation Timeline: 30-45 Minutes

**Step 1: Signup & Auth (2 min)**
- User signs up via GitHub OAuth (they're engineers, this is fast)
- Lands in dashboard

**Step 2: Connect BigQuery (5 min)**
- You ask: "Where's your data warehouse?"
- They select "BigQuery"
- You show form: "Paste your GCP service account JSON"
- They paste credentials (2 min to find in their GCP console)
- You test connection: "✅ Connected to 15 tables"

**Step 3: Create First Monitoring Rule (8 min)**
- They want to monitor the `transactions` table
- Form:
  ```
  Table: transactions
  Expected frequency: Hourly (they chose from dropdown)
  Tolerance: 10 minutes (default, they can adjust)
  Alert channel: Slack #data-ops
  ```
- You validate: "We'll check that data updates every hour. If it's stale for >70 min, we alert you"
- Save → Rule is live

**Step 4: Create Second Rule (5 min)**
- They want volume anomaly detection too
- Form:
  ```
  Table: transactions
  Monitor: Row count daily
  Baseline window: 30 days (data available)
  Alert if deviation: >30%
  Alert channel: Slack
  ```
- "If daily row count deviates >30% from your average, we'll alert you"

**Step 5: Invite Team (5 min)**
- Paste email: data-ops@fintech-startup.com
- Slack integration: Authorize bot to post to #data-ops

**Step 6: Test & Confirm (5 min)**
- You send: "Let's send a test alert to your Slack"
- They see test alert appear
- "Great! You're live. We'll monitor 24/7 starting now"

---

### Onboarding Support Needed

**What they'll ask (in order):**

1. **"How do I know the monitoring is actually working?"**
   - You show: Dashboard with last check time, next check scheduled at [time], status = OK
   - They refresh and see timestamp update in real-time
   - Confidence: Achieved

2. **"Can we get alerts for both Slack AND email?"**
   - Currently: Slack only in MVP
   - Workaround: Create a Slack-to-email rule on their end (Gmail filter)
   - Or: You add email alerts in Week 2 (easy feature)
   - They'll accept: "Slack is enough for now, we can add email later"

3. **"What if we want to monitor a table that doesn't update every hour?"**
   - Weekly table? You show: "Set frequency to weekly, tolerance to 1 day"
   - They'll figure it out from the UI

4. **"What if the rule triggers falsely?"**
   - You show: Alert suppression (coming in Phase 2) or they can adjust tolerance
   - "If we're adjusting tolerances too much, tell us—means the rule isn't right"

**Support effort**: ~15 min async (Slack support thread) + 5 min fix

---

### What Happens Next (Days 1-7)

**Day 1**: They monitor the dashboard obsessively. "Is it really working?"
- You stay responsive to any questions
- They might create 1-2 more rules based on other critical tables

**Day 2**: Everything quiet. They trust it's working.

**Day 3-7**: A real issue might occur
- Fivetran connection drops (as in their original story)
- Your alert fires: "Transactions table unchanged for 2+ hours"
- They see alert, fix Fivetran, data resumes
- They message you: "OMG this literally just saved us. The Fivetran issue we had before would have been caught immediately"

**Week 2-4**: They've integrated alerts into their on-call rotation
- `@data-ops` gets paged when your alert fires
- They've created 4-5 rules covering all critical tables

---

### Revenue & Expansion

**Month 1 pricing**: $199/month (4 tables monitored)

**Expansion opportunities** (Month 3+):
- Add data quality rules: "How many NULLs in user_id?" → Premium feature, +$99/mo
- Add Snowflake support (they might migrate) → Already built-in
- Team seat: CFO wants to see alerts directly → +$49/mo per user

**Year 1 trajectory**:
- Month 1: $199/mo
- Month 3: $348/mo (added data quality rules)
- Month 6: $348/mo (stable, no growth)
- Month 12: Still $348/mo (they're satisfied, not adding features)

**Why they stay**: Cost of switching is higher than switching. They've integrated you into workflows.

---

## Customer 2: DTC E-Commerce Brand (Skincare Shopify Store)

### Their Data Stack (Typical)

```
Shopify (store)
    ↓
Stitch (connector)
    ↓
Postgres (self-managed on RDS)
    ↓
Metabase (BI tool, self-hosted)
    ↓
Google Sheets (manual daily report)
```

**Key detail**: Their data engineer is 0.5 FTE (consultant, part-time). No dedicated DevOps.

---

### Implementation Timeline: 45-60 Minutes

**Step 1: Signup & Auth (2 min)**
- Sign up with email (not GitHub, they're less technical)
- Email confirmation link

**Step 2: Connect Postgres (8 min)**
- Form asks: "Where's your database?"
- They select "PostgreSQL"
- Form:
  ```
  Host: prod-postgres-01.xx.us-east-1.rds.amazonaws.com
  Port: 5432
  Database: analytics
  Username: stitch_read_user
  Password: [paste]
  ```
- Test connection: "✅ Connected to 28 tables"
- **Friction moment**: They have to find their RDS credentials
  - They might not know them (ask their part-time data engineer)
  - You provide UI hint: "These are in AWS RDS console under 'Credentials & auth'"
  - Adds 5-10 min

**Step 3: Select Critical Tables to Monitor (10 min)**
- You ask: "Which tables matter most?"
- They look at their Stitch connector
- Pick: `orders`, `order_items`, `customers`, `products`
- You explain: "For each, we'll monitor freshness and volume"

**Step 4: Create Monitoring Rules (10 min per table)**

**Table 1: orders**
```
Expected frequency: Every 15 minutes (Stitch runs frequently)
Tolerance: 10 minutes
Alert channel: Email to analyst@skincare.com AND data-ops@skincare.com
Alert if volume drops: >20% (less orders is scary)
Alert if volume spikes: >100% (traffic spike could mean fraud)
```

**Table 2: order_items**
```
Expected frequency: Every 15 minutes
Tolerance: 10 minutes
Alert channel: Same
```

**Table 3: customers**
```
Expected frequency: Every 30 minutes
Tolerance: 15 minutes
Alert channel: Email only (less critical)
```

**Table 4: products**
```
Expected frequency: Daily (product sync is slower)
Tolerance: 2 hours
Alert channel: Email (really not critical)
```

**Step 5: Test & Confirm (5 min)**
- Send test alerts
- Verify they arrive in inbox
- Done

---

### Onboarding Support Needed

**What they'll ask:**

1. **"What if I don't know my database credentials?"**
   - Provide: Step-by-step guide screenshot (AWS RDS console path)
   - Or: Offer to pair with them (15 min call) to find credentials
   - This is the biggest friction point for non-technical founders

2. **"Should we monitor every table?"**
   - You advise: "Start with 5-10 critical ones. We can add more later"
   - They'll pick 4-6

3. **"What does 'volume spike' mean?"**
   - Clarify: "If orders jump from 50/hr to 150/hr, we alert"
   - They ask: "Is that bad?" 
   - You respond: "Unusual. Could be good (flash sale!) or bad (data issue). You'll figure it out"

4. **"Can we get alerts on our mobile phone?"**
   - SMS support? Not in MVP
   - Email works for most
   - They'll accept email initially

**Support effort**: ~25 min (mostly helping find credentials) + 5-10 min follow-ups

---

### What Happens Next (Days 1-7)

**Day 1**: CEO is skeptical. "Is this really going to help?"
- Analyst sets up their alerts
- They look at dashboard together

**Day 2-3**: Nothing happens. System is quiet. Good sign.

**Day 4**: Volume spike alert fires
- "Order count jumped 95% in the last hour"
- They investigate: Flash sale was successful
- Not a data issue, but they're glad they know
- Confidence builds

**Day 5**: Stitch connector fails (the schema change from their story)
- Your alert fires: "order_items row count dropped 65% below baseline"
- They get alerted instead of discovering it Friday
- "This is exactly what we needed"

**Week 2**: Analyst has integrated monitoring into daily routine
- Checks dashboard in morning (2 min)
- Reviews any overnight alerts
- Feels more confident about data quality

---

### Revenue & Expansion

**Month 1 pricing**: $149/month (4-6 tables monitored)

**Expansion opportunities** (Month 3+):
- Add schema change detection: "Alert when columns are added/removed" → Premium, +$49/mo
- Add data lineage: "Show me where this data came from" → Premium, +$99/mo
- Slack integration (instead of email) → Free add-on

**Year 1 trajectory**:
- Month 1: $149/mo (analyst sets up)
- Month 3: $149/mo (stable)
- Month 6: $198/mo (added schema detection)
- Month 12: $198/mo (steady)

**Churn risk**: Medium
- If they hire full-time data engineer, might build internal solution
- But unlikely—your cost is too low and they'd rather focus on product
- You'll keep them through inertia + low switching cost

---

## Customer 3: Data-Driven Services Firm (Management Consulting)

### Their Data Stack (Mature, Complex)

```
HRIS (HR database)
    ↓
Airflow (orchestration, on-prem)
    ↓
dbt (transformation)
    ↓
Internal DuckDB (data warehouse on EC2)
    ↓
Tableau (dashboarding)
    ↓
Custom governance (access controls)
```

**Key detail**: They have 2 FTE data engineers. They're sophisticated. They've looked at Great Expectations but found it complex.

---

### Implementation Timeline: 60-90 Minutes

**Step 1: Signup & Auth (2 min)**
- Sign up with company email
- SSO via company Okta? (You'll add this later, for now just email)

**Step 2: Architecture Discussion (15 min)**
- They ask: "Does this integrate with Airflow?"
- You clarify: "We monitor data freshness and volume. You tell us what to monitor, we do the rest. Airflow is upstream; we're downstream."
- They ask: "Can we use this with dbt?"
- You respond: "dbt tables feed your DuckDB. We monitor DuckDB. Perfect fit."
- They ask: "How do you handle 50+ tables?"
- You respond: "We handle it. Add rules via API if you want to script it."

**Step 3: Connect DuckDB (10 min)**
- They need to expose DuckDB over network (might not be by default)
- You provide: "Set up read-only user in DuckDB, give us connection string"
- They do this: 5-10 min (data engineers know how)
- Test connection: "✅ Connected to 47 tables"

**Step 4: Select Tables for Monitoring (15 min)**
- They identify critical tables:
  - `timesheet_summary` (the one that failed in their story)
  - `billing_reconciliation`
  - `project_profitability`
  - `resource_allocation`
  - `monthly_financials` (monthly, not real-time)

**Step 5: Create Monitoring Rules (20 min)**

**Table 1: timesheet_summary**
```
Source: Nightly Airflow DAG from HRIS API
Expected frequency: Daily (runs at 2 AM UTC)
Tolerance: 4 hours
Alert on freshness: Yes (critical)
Alert on volume change: >10% (should be stable)
Alert channel: Slack #data-eng + PagerDuty (on-call rotation)
Alert severity: Critical
Who to notify: data-eng team + CFO
```

**Table 2: billing_reconciliation**
```
Expected frequency: Daily (end of day)
Tolerance: 2 hours
Alert on freshness: Yes
Alert on volume: If row count differs >5% (tight tolerance, high confidence)
Alert channel: Slack + email to CFO
Severity: High
```

**Table 3: project_profitability**
```
Expected frequency: Daily
Tolerance: 6 hours (slightly stale is OK, but not for a whole day)
Alert on freshness: Yes
Alert on volume: Only if <50% of expected (data quality issue)
Alert channel: Slack + PagerDuty
Severity: High
```

**Table 4: resource_allocation**
```
Expected frequency: Daily
Alert on freshness: Yes
Alert on volume: Don't alert on volume (this table naturally varies)
Tolerance: 6 hours
Alert channel: Slack
Severity: Medium
```

**Table 5: monthly_financials**
```
Expected frequency: Monthly (runs on 1st of month)
Tolerance: 12 hours
Alert on freshness: Yes
Alert on volume: Don't alert (completely different shape month-to-month)
Severity: Medium
```

**Step 6: Governance & Access Control (15 min)**
- They ask: "Who can see alerts?"
- You show: Team management UI
- They add: data-eng team + finance team + CFO
- Set permissions: "Finance team sees alerts for billing, profitability. Data-eng sees all."

**Step 7: API Integration (10 min)**
- They ask: "Can we script rule creation?"
- You say: "Yes, we have an API"
- They might want to:
  - Auto-create rules for every dbt model
  - Auto-adjust thresholds based on historical data
  - Integrate with Airflow (send alert when your DAG detects an issue)
- You provide: API docs and example curl requests

**Step 8: Test & Confirm (10 min)**
- Send test alerts to all channels
- They verify in Slack and email
- Done

---

### Onboarding Support Needed

**What they'll ask:**

1. **"Does this work with our Airflow DAGs?"**
   - You clarify: "We're independent. Your DAGs produce data; we monitor it. But we can send alerts back to Airflow if you want (Phase 2 feature)"
   - They're OK with that

2. **"Can we export monitoring rules as code?"**
   - Yes, via API (provide examples)
   - They might want to version-control rules in Git
   - You provide YAML export format (they'll appreciate this)

3. **"How do you handle schema evolution?"**
   - You respond: "Currently, if a column is added, we'll still work. If a column is removed, the check might error (you'll be alerted). Phase 2 adds automatic schema change detection."
   - They'll accept this and might build their own schema tracking in Airflow

4. **"Can we get historical data about check failures?"**
   - You show: "All checks and their results are stored. You can query via API or download CSV"
   - They'll love this for auditing and compliance

5. **"Does this integrate with our data governance tool?"**
   - Current answer: "Not yet. But you can export alerts to trigger custom webhooks"
   - They'll build their own integration

**Support effort**: ~20 min (architecture questions) + 10-15 min integration help + 5 min follow-ups

---

### What Happens Next (Days 1-7)

**Day 1**: Data engineers set up monitoring
- They create 5 rules in 30 min
- Add team members
- Test alerts

**Day 2-3**: Everything quiet. System is working.

**Day 4**: HRIS API format changes (their original problem scenario)
- DAG runs successfully (no error logs)
- But timesheet_summary table doesn't update
- Your alert fires at 6 AM: "timesheet_summary unchanged for 4+ hours. Last update: [timestamp]"
- Data engineers wake up to alert (on-call rotation)
- They check Airflow logs, find the API format change
- Fix and replay within 1 hour
- Instead of 30-hour delay (until weekly partner review), it's 1 hour

**Day 5**: They send you feedback
- "This literally saved us from a $400k misallocation. You're worth every penny."
- They start thinking about other use cases

**Week 2**: Integration deepens
- They've created 10+ rules covering all critical paths
- They've integrated with PagerDuty (your alerts page their on-call)
- They're thinking about adding your service to their onboarding (new data engineers learn about it)

---

### Revenue & Expansion

**Month 1 pricing**: $299/month (5+ tables, complex governance)

**Expansion opportunities** (Month 3+)**:
- API quota increases: Want to create 100+ rules? → Tier up, +$99/mo
- Data quality validation: "Custom SQL checks for business rules" → Premium, +$199/mo
- Lineage tracking: "Show me data dependencies" → Premium, +$299/mo
- Historical analysis: "Compare alert patterns month-over-month" → Premium, +$149/mo

**Year 1 trajectory**:
- Month 1: $299/mo (initial setup)
- Month 3: $499/mo (added API tier + data quality rules)
- Month 6: $699/mo (added lineage tracking)
- Month 12: $799/mo (multiple expansions, becoming strategic)

**Expansion vector**: They have budget. They're sophisticated. They'll buy more features as you build them.

**Churn risk**: Very low
- They're data-driven; they measure value you provide
- Cost is negligible compared to value ($400k+ saved)
- Switching cost is high (rules are embedded in their workflows)
- They'll be your reference customer (tell other consulting firms)

---

## Implementation Comparison Table

| Aspect | FinTech | DTC E-Commerce | Services Firm |
|--------|---------|----------------|---------------|
| **Time to first alert** | 30 min | 45 min | 90 min |
| **Technical skill required** | High (engineer) | Medium (analyst) | High (data engineer) |
| **Credential friction** | Low (they know GCP) | High (might not know RDS) | Low (they have DBA) |
| **Initial rule count** | 2-4 | 4-6 | 5-10 |
| **Support needed** | 15 min | 25 min | 20-30 min |
| **API integration** | Unlikely (month 3+) | Unlikely | Likely (week 1) |
| **Churn risk** | Low | Medium | Very low |
| **Expansion velocity** | Slow (happy with basic) | Medium (if you add features) | Fast (everything interests them) |
| **Reference value** | High (FinTech community) | High (e-commerce community) | Very high (consulting networks) |

---

## Support Load Estimation (Year 1)

### Month 1 (Launch)

Assuming you acquire 20 customers across the three archetypes:
- 8 FinTech startups: 15 min × 8 = 2 hrs
- 8 DTC brands: 25 min × 8 = 3.3 hrs
- 4 Services firms: 30 min × 4 = 2 hrs
- **Total**: ~7.3 hrs onboarding support

**+ Follow-up questions**: 2-3 hours async (Slack support threads)

**Total Month 1**: ~10 hours

### Month 2-3

- Onboarding new customers: 5 hours/month
- Support questions: 3-5 hours/month
- Bug fixes from customer feedback: 2-3 hours/month
- Feature requests fielding: 2-3 hours/month

**Total Month 2-3**: 12-16 hours/month

### Month 4+ (Stabilization)

- Onboarding: 3-4 hours/month (slower sales)
- Support: 2-3 hours/month (customers are self-sufficient)
- Bug fixes: 1-2 hours/month (product is stable)
- Features: 2-4 hours/month (building Phase 2 features)

**Total Month 4+**: 8-13 hours/month

---

## Key Insights for Your Business

### What Makes Implementation Smooth

1. **FinTech & Services firms**: They have technical staff who can troubleshoot
   - Less hand-holding needed
   - Faster to value

2. **DTC brands**: They need more support (less technical staff)
   - But this is OK; it's only 25 min per customer
   - Opportunity to impress and lock them in
   - High NPS from good onboarding

### What Creates Friction

1. **Database credentials** (for all customers)
   - Biggest bottleneck for non-engineers
   - Solution: Provide detailed guides + offer 15-min pairing call
   - This is worth automating (write a KB article with screenshots)

2. **Rule configuration** (for all customers)
   - What's a good "tolerance"? What's "normal volume variance"?
   - Solution: Provide smart defaults based on historical data
   - Show them examples for their archetype

3. **Monitoring philosophy** (for sophisticated customers)
   - They might ask: "Should we monitor this table?"
   - Help them think through: "Is this decision-critical?"
   - If yes → monitor. If no → don't.

### What Creates Loyalty

1. **Fast time-to-first-alert**: Getting them monitoring in 30-90 min creates immediate value
2. **Showing you understand their pain**: "We know this exact problem from [customer story]"
3. **Responsive support**: Quick answers to questions build trust
4. **Proactive feature building**: What features do they mention? Build them within 2-3 months → they feel heard

---

## Go-to-Market Implication

These three archetypes have very different buying journeys:

**FinTech**: 
- Buy via: VP of Engineering / Head of Data
- Decision time: Fast (pain is acute)
- Pitch: "We catch the problems you're having now"

**DTC E-Commerce**:
- Buy via: Operations Manager or Founder + Analyst
- Decision time: Slower (pain is chronic, not acute)
- Pitch: "We give you peace of mind about data"
- Leverage: Free 30-day trial → they'll see value once data actually breaks

**Services Firm**:
- Buy via: VP of Data / Head of Analytics + CFO
- Decision time: Medium (ROI is easy to calculate)
- Pitch: "We prevent decisions on bad data"
- Leverage: Show them the $400k+ savings calculation

For early-stage, I'd target: **FinTech first** (pain is acute, buying is fast), then **Services firms** (high expansion revenue), then **DTC** (larger volume, slower sales).
