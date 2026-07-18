# APZHUB Product Portfolio Strategy

> **Milestone:** PCS-001  
> **Status:** Strategic classification — planning only  
> **Authority:** [Document 002 — Terminology](../002-product-naming-positioning-terminology-standard.md) · [PC-001 Certification](../reviews/APZHUB-Platform-Core-Certification.md)

---

## Portfolio overview

```text
                    ┌─────────────────────────────────┐
                    │         PLATFORM CORE           │
                    │  (Runtime, IAM, Ops, Security)  │
                    └─────────────────────────────────┘
                                      │
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
   Productivity    Vertical        Shared         Developer      Future
   Modules         Products        Engines        Platform       Verticals
   (OSS-backed)    (native)        (extracted)    (internal)     (TBD)
```

---

## Product classification

| Product                    | Type                | Status                              | Commercial                        | Platform ownership                |
| -------------------------- | ------------------- | ----------------------------------- | --------------------------------- | --------------------------------- |
| **Platform**               | Core                | v1.0 certified                      | Internal + future SaaS license    | **Platform team**                 |
| **Law Platform**           | Vertical product    | Validation advanced (LAW-001–015)   | **Commercial offering** (primary) | Product team; consumes Core       |
| **Trust Accounting**       | Law capability      | Milestone closed                    | Part of Law offering              | Law product; not standalone       |
| **Financial Engine**       | Shared engine       | Planning (FIN-001 defer)            | Licensed component (future)       | Platform/shared — post-extraction |
| **Exchange (APZEX)**       | Vertical product    | Not started                         | Commercial (when chartered)       | Product team                      |
| **Banking (APZBNK)**       | Vertical product    | Not started                         | Commercial (when chartered)       | Product team                      |
| **Projects**               | Productivity module | Planned (Plane OSS)                 | Bundled in platform suite         | Platform Service + connector      |
| **Documents**              | Productivity module | Planned (Paperless OSS)             | Bundled                           | Platform Service + connector      |
| **Time Tracking**          | Productivity module | Planned (Kimai OSS)                 | Bundled                           | Platform Service + connector      |
| **Support**                | Productivity module | Planned (Zammad OSS)                | Bundled                           | Platform Service + connector      |
| **Analytics**              | Productivity module | Planned (Metabase OSS)              | Bundled                           | Platform Service + connector      |
| **Automation**             | Productivity module | Planned (n8n OSS)                   | Bundled                           | Platform Service + connector      |
| **Testing**                | Productivity module | Planned (Kiwi TCMS OSS)             | Bundled                           | Platform Service + connector      |
| **Security Ops**           | Ops module          | Planned (Greenbone, Faraday, MobSF) | Enterprise add-on                 | Platform connectors               |
| **Identity (user-facing)** | Core capability     | Delivered (M8-01)                   | Never sold separately             | **Platform Core**                 |
| **Developer Platform**     | Internal            | Partial (docs, SDKs, manifests)     | **Internal only**                 | Platform team                     |

---

## Shared capabilities

Capabilities **shared across products** (owned by Platform Core or extracted engines):

| Capability                 | Owner             | Consumers              |
| -------------------------- | ----------------- | ---------------------- |
| Identity & tenants         | Platform Core     | All products           |
| Authorization / RBAC       | Platform Core     | All products           |
| Workbench shell            | Platform Core     | All products           |
| Actions / Command palette  | Platform Core     | All products           |
| Knowledge / Search         | Platform Core     | All products + modules |
| Events & Notifications     | Platform Core     | All products           |
| Activity timeline          | Platform Core     | All products           |
| Governance & feature flags | Platform Core     | All products           |
| Security & operations      | Platform Core     | Operators              |
| Ledger primitives (future) | Financial Engine  | Law, Banking, Exchange |
| Document metadata patterns | Platform patterns | Law, Documents module  |
| Audit envelope             | Platform Core     | All products           |

---

## Product boundaries

### Rule: Module → Platform Service → Connector → Engine

| Layer                | Law Platform example            | Projects module example    |
| -------------------- | ------------------------------- | -------------------------- |
| **Module**           | `law-matters` workbench views   | `projects` workbench views |
| **Platform Service** | `MatterService`, `TrustService` | `ProjectService`           |
| **Connector**        | (native persistence)            | `PlaneAdapter`             |
| **Engine**           | PostgreSQL (Law schema)         | Plane CE API               |

**Violations to avoid:**

- Law module calling Plane API directly
- Trust logic in Workbench framework
- Product-specific RBAC outside Authorization service
- Duplicate health/diagnostics per product

---

## Platform ownership matrix

| Concern             | Platform owns             | Product owns                 |
| ------------------- | ------------------------- | ---------------------------- |
| Login UX            | ✅ (BetterAuth)           | —                            |
| Permission keys     | ✅ manifest registry      | product namespace only       |
| Tenant isolation    | ✅ policy + RLS framework | product RLS policies         |
| Navigation shell    | ✅ Workbench              | module registration          |
| Business entities   | —                         | ✅ matters, trades, accounts |
| Compliance rules    | —                         | ✅ jurisdiction profiles     |
| REST API shape      | ✅ envelope standard      | ✅ domain routes             |
| OSS engine upgrades | ✅ connector + runbook    | —                            |

---

## Commercial offerings vs internal only

### Commercial offerings (external revenue)

| Offering                        | Rationale                                    |
| ------------------------------- | -------------------------------------------- |
| **Law Platform**                | Primary validated vertical; regulated market |
| **Enterprise Platform license** | Self-hosted multi-product deployment         |
| **Managed APZHUB Cloud**        | SaaS tier (post PCv2)                        |
| **Exchange / Banking**          | When chartered and validated                 |
| **Enterprise security pack**    | Greenbone/Faraday/MobSF connectors + ops     |

### Internal only

| Item                              | Rationale                                     |
| --------------------------------- | --------------------------------------------- |
| **Developer Platform tooling**    | Engineering productivity; not customer-facing |
| **Platform Operations Console**   | Operator surface; not a SKU                   |
| **Manifest development workflow** | Internal SDK                                  |
| **CI/CD infrastructure**          | Engineering                                   |
| **Pre-release validation apps**   | `apps/web` as platform shell host             |

### Bundled (not standalone SKU initially)

Productivity modules (Projects, Documents, Time, etc.) ship as **platform capabilities** — not separate products — until market demands unbundling.

---

## Product sequencing (strategic)

> **Owner-approved:** PCv2-01 → PCv2-02 → M17 → OSS Waves. See [PCS-001 Owner Approval](./PCS-001-owner-approval.md).

```text
1. PCv2-01 Production SaaS Hardening
2. PCv2-02 Background Workers & Outbox
3. M17 CI/CD & E2E Automation
4. OSS Waves 1–3 (Plane → Kimai → Paperless)
5. OSS Waves 4–9 (Support through Security Ops)
6. Law Platform production readiness (parallel where resourced)
7. PCv2 enterprise phases (Vault, observability, gateway, commercial)
8. Financial Engine extraction (not approved — when preconditions met)
9. Exchange OR Banking charter (not approved)
```

---

## Future vertical products

New verticals must:

1. Consume Platform Core exclusively.
2. Publish `module.yaml` before code.
3. Implement Platform Services — no connector calls from UI.
4. Register governance capabilities and feature flags.
5. Pass product validation strategy (E2E, RBAC, events).

**No new vertical starts** until owner approves charter and Platform Core v2-01 minimum is met.

---

## References

- [Platform Core Strategy](./APZHUB-Platform-Core-Strategy.md)
- [OSS Integration Strategy](./APZHUB-OSS-Integration-Strategy.md)
- [FIN-001 Architecture Review](../reviews/FIN-001-Architecture-Review.md)
- [Law Platform Readiness](../reviews/APZHUB-Law-Platform-Readiness.md)
