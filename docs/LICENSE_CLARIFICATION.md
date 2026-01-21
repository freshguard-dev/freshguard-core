# License Clarification: Open Core Model

This document clarifies the licensing and structure of the FreshGuard ecosystem to help users, contributors, and developers understand what's open source and what's proprietary.

## 🏗️ Open Core Architecture

FreshGuard follows an **open core model** where:
- The **core monitoring engine** is open source (MIT licensed)
- The **multi-tenant SaaS platform** is proprietary (separate repository)

```
┌─────────────────────────────────────┐
│        FreshGuard Ecosystem         │
├─────────────────────────────────────┤
│  🌟 OPEN SOURCE CORE (This Repo)    │
│  • Single-tenant monitoring engine  │
│  • Database connectors             │
│  • Monitoring algorithms           │
│  • CLI tools                       │
│  • MIT License                     │
├─────────────────────────────────────┤
│  🔒 PROPRIETARY CLOUD (Private)     │
│  • Multi-tenant SaaS platform      │
│  • User authentication             │
│  • Team management                 │
│  • Dashboard UI                    │
│  • Billing system                  │
│  • Closed source                   │
└─────────────────────────────────────┘
```

## ✅ What's Open Source (MIT Licensed)

### This Repository: `github.com/freshguard/freshguard`

**Core Functionality:**
- ✅ Data pipeline freshness monitoring algorithms
- ✅ Volume anomaly detection
- ✅ Schema change detection
- ✅ Database connectors (PostgreSQL, DuckDB, BigQuery, etc.)
- ✅ SQL query execution engine
- ✅ Alerting logic and message formatting
- ✅ CLI tools for self-hosted deployments
- ✅ Single-tenant database schema
- ✅ Configuration management
- ✅ Error handling and logging

**Packages:**
- ✅ `@thias-se/freshguard-core` - Core monitoring engine
- ✅ `@thias-se/freshguard-types` - Shared TypeScript types

**Use Cases:**
- ✅ Self-hosted monitoring for teams
- ✅ Integration into existing data platforms
- ✅ Custom monitoring solutions
- ✅ Educational and research purposes
- ✅ Commercial use (within MIT license terms)

## 🔒 What's Proprietary (Closed Source)

### Private Repository: `github.com/YOUR-ACCOUNT/freshguard-cloud`

**Cloud-Specific Features:**
- ❌ Multi-tenant isolation and workspace management
- ❌ User authentication (GitHub OAuth, email/password)
- ❌ Team collaboration features
- ❌ Web dashboard and UI components
- ❌ Billing and subscription management
- ❌ Usage analytics and telemetry
- ❌ Customer support integrations
- ❌ Enterprise features (SSO, SCIM, etc.)

**Why These Are Proprietary:**
- Complex multi-tenant architecture
- SaaS-specific operational concerns
- Business model sustainability
- Competitive differentiation

## 📋 Licensing FAQs

### Can I use FreshGuard Core commercially?

**Yes!** The MIT license explicitly allows commercial use. You can:
- ✅ Deploy it in your company
- ✅ Integrate it into commercial products
- ✅ Modify it for your needs
- ✅ Sell services built on top of it

### Can I fork and modify the core?

**Absolutely!** You have full rights to:
- ✅ Fork the repository
- ✅ Modify the code
- ✅ Create derivative works
- ✅ Distribute your modifications
- ✅ Change the license of your fork (to compatible licenses)

### Can I create a competing SaaS?

**Yes!** The MIT license allows this, but note:
- ✅ You can build a SaaS using the open core
- ✅ You can add proprietary features on top
- ❌ You cannot access our proprietary cloud code
- ❌ You cannot use our trademarks or branding

### What about contributions?

When you contribute to this repository:
- ✅ Your contributions become MIT licensed
- ✅ They remain open source forever
- ✅ They can be used by both the community and FreshGuard Cloud
- ✅ You retain attribution in the git history

### Can I access the FreshGuard Cloud source?

**No.** The cloud platform is proprietary and not available as open source. However:
- ✅ The core functionality is equivalent
- ✅ You can build similar features using the open core
- ✅ APIs and integrations are documented

## 🛠️ Self-Hosting vs. Cloud

### Self-Hosting with FreshGuard Core

**Advantages:**
- ✅ Full control over your data
- ✅ No vendor lock-in
- ✅ Customizable to your needs
- ✅ No recurring SaaS fees
- ✅ On-premises deployment

**Requirements:**
- 🔧 You manage infrastructure
- 🔧 You handle updates and maintenance
- 🔧 You implement user authentication (if needed)
- 🔧 You build dashboards (if needed)

**Best For:**
- Teams with DevOps expertise
- Organizations with strict data policies
- Cost-sensitive deployments
- Custom integration requirements

### FreshGuard Cloud (SaaS)

**Advantages:**
- ✅ Managed infrastructure
- ✅ Multi-tenant with team collaboration
- ✅ Web dashboard included
- ✅ Automatic updates
- ✅ Enterprise features

**Trade-offs:**
- 💰 Recurring subscription costs
- 🔒 Data stored in cloud
- 🎛️ Less customization

**Best For:**
- Teams wanting quick setup
- Organizations preferring managed services
- Multi-team collaborations
- Enterprise feature requirements

## 🔄 Open Core Benefits

This model provides benefits for everyone:

### For the Community
- ✅ Access to production-quality monitoring engine
- ✅ Freedom to modify and extend
- ✅ No vendor lock-in
- ✅ Transparent development

### For Contributors
- ✅ Open source contributions are valued
- ✅ Code remains open forever
- ✅ Attribution preserved
- ✅ Portfolio building opportunities

### For FreshGuard
- ✅ Sustainable business model
- ✅ Community-driven innovation
- ✅ Shared maintenance burden
- ✅ Market validation

## 📜 License Compatibility

The MIT license is compatible with:
- ✅ Apache 2.0
- ✅ BSD licenses
- ✅ GPL v3+ (one-way compatibility)
- ✅ Most commercial licenses

You can combine FreshGuard Core with most other open source projects.

## 🚨 Trademark Notice

- "FreshGuard" is a trademark
- You may use the code under MIT license
- Separate permission needed for trademark use
- Consider using different branding for forks

## 📞 Contact

### Questions about licensing?
- 📧 Email: legal@freshguard.com
- 💬 GitHub Discussions for general questions
- 🐛 GitHub Issues for technical questions

### Want to contribute?
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Need enterprise support?
Contact sales@freshguard.com for:
- Enterprise licensing
- Custom development
- Professional services
- Migration assistance

---

**Last updated:** 2026-01-21

This document clarifies our open core approach and licensing. When in doubt, the MIT license in the repository root is the authoritative legal document.