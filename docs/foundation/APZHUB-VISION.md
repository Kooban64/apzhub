# APZHUB Vision

> **Purpose:** Long-term vision, strategy, and directional aspirations  
> **Audience:** Owners, architects, product leaders, investors, AI agents  
> **Authoritative references:** [001 — Vision](../001-project-vision-and-guiding-principles.md) · [Platform Core Strategy](../strategy/APZHUB-Platform-Core-Strategy.md) · [Commercial Roadmap](../strategy/APZHUB-Commercial-Roadmap.md)  
> **Related documents:** [APZHUB-MASTER-BRIEF](./APZHUB-MASTER-BRIEF.md) · [AI-CONTEXT](./AI-CONTEXT.md)  
> **Reading order:** After Master Brief; before product-specific planning  
> **Last updated:** 2026-07-10  
> **Current status:** Active — derived from PCS-001 and foundation docs

---

## Long-term vision

APZHUB becomes the **operating system for professional and enterprise work** — one workbench where teams manage projects, documents, time, support, analytics, automation, testing, compliance, and vertical domains (law, finance, exchange) without switching between disconnected tools or seeing vendor branding.

The platform is:

- **Self-hostable** by default — data sovereignty for regulated industries
- **Modular** — engines replaceable via adapter contracts
- **Governed** — identity, permissions, audit, and lifecycle centrally owned
- **AI-ready** — search, commands, and workflows prepared for governed AI assistance

---

## Five-year roadmap (summary)

| Horizon | Focus |
|---------|-------|
| **Year 1 (current)** | Platform Core certification; Law Platform validation; Integration SDK; Wave 1 OSS (Projects) |
| **Year 2** | Remaining OSS waves; Quality Engineering; PCv2 operational maturity (workers, HA, vault) |
| **Year 3** | Commercial GA tiers; multi-tenant SaaS option; Financial Engine extraction decision |
| **Year 4** | Additional verticals (Exchange, Banking); marketplace/partner integrations |
| **Year 5** | Platform ecosystem — third-party modules, white-label, governed AI across domains |

**Canonical detail:** [Platform Core Strategy](../strategy/APZHUB-Platform-Core-Strategy.md) · [Engineering Roadmap](../strategy/APZHUB-Engineering-Roadmap.md) · [OSS Wave Roadmap](../strategy/APZHUB-OSS-Wave-Roadmap.md)

---

## Platform aspirations

1. **One workbench** — Desktop shell with permission-driven navigation, commands, search, notifications, activity
2. **One API surface** — Client never knows engine topology
3. **One identity** — SSO across all engines; platform-owned RBAC
4. **One operations model** — Health, diagnostics, lifecycle, control plane
5. **One integration pattern** — Integration SDK + manifests for every OSS engine

---

## Commercial strategy

Evolution tiers (from [Commercial Roadmap](../strategy/APZHUB-Commercial-Roadmap.md)):

```text
Internal deployment → Pilot customers → Enterprise licensed → Managed SaaS → Marketplace ecosystem
```

**Primary commercial product today:** Law Platform (including Trust Accounting).

**Platform Core:** Internal foundation; future platform license / SaaS tier.

**Productivity modules:** Bundled in platform suite when OSS integrations complete.

---

## Self-hosted strategy

- **Default deployment:** Customer-controlled infrastructure
- **OSS engines:** Community Edition, self-hosted first
- **Platform stack:** PostgreSQL, Redis, Caddy/Nginx, Docker Compose
- **No mandatory commercial dependencies** for core functionality
- **Data sovereignty:** Platform metadata in platform DB; engine data in engine DBs

See [004 — Technology Stack](../004-technology-stack-repository-standards-development-environment.md) · [Self-hosted first principle](../000-apzhub-engineering-constitution.md).

---

## Cloud strategy

Cloud is an **optional deployment model**, not the default:

- Managed APZHUB instances for customers who prefer not to operate infrastructure
- Same architecture — no cloud-only features that break self-hosted parity
- Tenant isolation and secrets management adapted for cloud ops (PCv2-02+)
- Commercial GA requires operational maturity (workers, CI, vault, HA) — not yet complete

---

## AI strategy

Governed AI across platform domains — **not** uncontrolled LLM integration:

| Domain | Approach |
|--------|----------|
| **Command palette** | AI-ready ranking and action suggestions |
| **Unified search** | Semantic/vector search without redesign (PostgreSQL FTS first) |
| **Documentation** | AI agents read Knowledge Foundation — not chat history |
| **Code generation** | Manifest-first; architecture compliance mandatory |
| **Product AI** | Per-product policies; audit; no credential exposure |

See [AI Strategy](../strategy/APZHUB-AI-Strategy.md) · [020 — Unified Search](../020-unified-search-knowledge-discovery-framework.md).

---

## Integration vision

Nine OSS waves covering Projects, Time, Documents, Support, Analytics, Automation, Testing, and Security Ops — each following Module → Platform Service → Adapter → Engine.

**Canonical plan:** [OSS-001 Master Plan](../strategy/OSS-001-APZHUB-OSS-Integration-Master-Plan.md)

---

## Quality vision

Native Quality Engineering capability (Wave 5) — test management without exposing Kiwi TCMS to users. Complements OSS Testing wave.

See [Quality Engineering Platform Strategy](../strategy/APZHUB-Quality-Engineering-Platform-Strategy.md).

---

## What we are not building (yet)

- Financial Engine extraction (deferred — FIN-001)
- Plane adapter implementation (blocked until OSS-100-05+)
- SaaS marketplace
- Unchartered verticals (Exchange, Banking)

See [CURRENT-MILESTONE](./CURRENT-MILESTONE.md).
