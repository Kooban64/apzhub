# APZHUB Platform Core Strategy

> **Milestone:** PCS-001 — Platform Core Strategy  
> **Status:** **Master strategy** — authoritative long-term direction  
> **Date:** 2026-07-08  
> **Authority:** [Engineering Constitution](../000-apzhub-engineering-constitution.md) · [Document 001 — Vision](../001-project-vision-and-guiding-principles.md) · [PC-001 Certification](../reviews/APZHUB-Platform-Core-Certification.md)

---

## Executive summary

APZHUB is evolving from a certified **Platform Core v1.0** (internal validation foundation) into a **multi-product enterprise platform** that unifies professional work behind one desktop-style experience. This strategy defines the five-year direction: self-hosted first, OSS engines as backends, APZHUB-owned experience and governance, and a phased path to commercial SaaS without sacrificing architectural integrity.

**All future Platform Core and product work must align with this document.**

---

## Vision (five years)

**APZHUB becomes the operating system for professional organisations** — one seamless workbench where users access projects, documents, time, support, analytics, automation, compliance, and vertical products (law, exchange, banking) without seeing underlying engines.

By 2031:

- A **certified, hardened Platform Core** powers every APZHUB product and partner integration.
- **Self-hosted enterprise** deployments are first-class; managed cloud is an option, not a dependency.
- **OSS engines** (Plane, Paperless, Kimai, etc.) are invisible backends behind Platform Services.
- **Vertical products** (Law, Exchange, Banking) share financial, identity, and operational primitives.
- **AI** augments discovery, operations, and domain workflows — governed, auditable, and optional (local or cloud).
- Users experience **one application**; operators manage **one platform**.

---

## Mission

Deliver a manifest-driven, permission-gated, self-hosted enterprise platform that:

1. **Unifies** work behind a single Workbench experience.
2. **Integrates** best-of-breed OSS engines without exposing them to users.
3. **Owns** identity, authorization, audit, security, and operational visibility.
4. **Enables** vertical products to ship faster by consuming Platform Core — never duplicating it.
5. **Preserves** architectural discipline through SDKs, ADRs, and phase gates.

---

## Architectural principles

These are non-negotiable (Documents 003, 008, 024):

| Principle                    | Implication                                                       |
| ---------------------------- | ----------------------------------------------------------------- |
| **Not a portal**             | No links to backend UIs; APZHUB APIs only                         |
| **Layered architecture**     | Presentation → Service → Connector → Engine — no bypass           |
| **Manifest first**           | Contract before code for modules, services, integrations, events  |
| **Platform owns IAM**        | BetterAuth authenticates; APZHUB owns permissions, tenants, audit |
| **One Workbench**            | Products register modules; no isolated page layouts               |
| **Events, not coupling**     | Modules publish events; platform delivers notify/search/audit     |
| **Self-hosted OSS first**    | CE/community editions; no mandatory commercial dependencies       |
| **Zero Trust**               | Verify identity, permission, context on every request             |
| **System of Record clarity** | One authoritative store per datum (Document 011)                  |

---

## Long-term goals

### Platform goals

| Horizon    | Goal                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| **Year 1** | Platform Core v2 — production hardening, workers, gateway, observability            |
| **Year 2** | First OSS productivity integrations (Projects, Documents, Time) via Integration SDK |
| **Year 3** | Commercial SaaS pilot; Law Platform GA; Exchange or Banking validation              |
| **Year 4** | Partner ecosystem; marketplace for modules; Financial Engine extracted              |
| **Year 5** | Multi-region SaaS; Platform Core v3; AI platform maturity                           |

### Product goals

| Product                | Goal                                                               |
| ---------------------- | ------------------------------------------------------------------ |
| **Law Platform**       | Regulated firm operations — matters, trust, billing, documents     |
| **Exchange**           | Trading/compliance vertical (when chartered)                       |
| **Banking**            | Ledger-centric financial product (when chartered)                  |
| **Productivity suite** | Projects, Documents, Support, Time, Analytics, Automation, Testing |
| **Financial Engine**   | Shared ledger primitives across verticals (post-extraction)        |

---

## Platform philosophy

```text
Users see APZHUB.
Operators see Platform Core.
Engines are infrastructure.
Products are capabilities.
```

1. **Experience is the product** — backends are replaceable if the service contract holds.
2. **Consistency over novelty** — registry patterns, not one-off integrations.
3. **Phased delivery** — certification before expansion; strategy before implementation.
4. **Debt is documented** — Technical Debt Register is a first-class artifact.
5. **Products validate platform** — Law Platform proved the model; more products must follow it.

---

## Commercial direction

| Phase                   | Description                         | Timeline                   |
| ----------------------- | ----------------------------------- | -------------------------- |
| **Internal platform**   | Engineering demos, validation       | **Now** (PC-001 certified) |
| **Pilot platform**      | Supervised single-firm / single-org | Post PCv2-01               |
| **Enterprise platform** | Self-hosted multi-tenant, SLA       | Post PCv2-06/07            |
| **Commercial SaaS**     | Managed multi-tenant, billing       | Year 3+                    |
| **Marketplace**         | Partner modules and integrations    | Year 4+                    |

**Revenue philosophy:** Platform licensing and vertical product subscriptions. OSS engines remain free; APZHUB value is integration, UX, governance, and operations.

See [Commercial Roadmap](./APZHUB-Commercial-Roadmap.md).

---

## Open-source strategy

| Layer                    | Strategy                                                                      |
| ------------------------ | ----------------------------------------------------------------------------- |
| **APZHUB Platform Core** | Source-available or proprietary (owner decision); architecture is the moat    |
| **OSS engines**          | Integrate CE/self-hosted; never fork unless upstream blocks critical path     |
| **Observability**        | Prometheus, Grafana, Loki — behind connectors, not user-facing                |
| **Auth**                 | **BetterAuth only** for APZHUB; Authentik legacy host until APZPRD retirement |
| **AI**                   | Local models (Ollama, etc.) + optional cloud APIs; no single-vendor lock-in   |

**Rule:** Every OSS integration gets `integration.yaml`, health checks, upgrade runbook, and replacement strategy before production.

See [OSS Integration Strategy](./APZHUB-OSS-Integration-Strategy.md).

---

## Enterprise strategy

Target: regulated and security-conscious organisations (law, finance, government contractors).

| Capability             | Enterprise requirement      | Platform owner              |
| ---------------------- | --------------------------- | --------------------------- |
| Self-hosted deployment | Docker Compose / K8s        | Platform + docs             |
| RBAC                   | Manifest-driven permissions | Platform Authorization      |
| Audit                  | Immutable audit trail       | Platform + product services |
| SSO/SAML               | Per-engine + platform SSO   | Identity + connectors       |
| Air-gap                | No mandatory cloud          | Architecture constraint     |
| HA/DR                  | Multi-instance, backup      | PCv2-06                     |
| SOC 2 readiness        | SIEM export, policies       | PCv2-05                     |

**Enterprise is not a separate product** — it is a deployment tier on the same Platform Core.

---

## Cloud strategy

| Model                             | Position                                                              |
| --------------------------------- | --------------------------------------------------------------------- |
| **Self-hosted (primary)**         | Customer VPC or on-prem; full control                                 |
| **Managed APZHUB Cloud (future)** | Same codebase; tenant isolation via platform RLS + governance         |
| **Hyperscaler-specific services** | **Avoid as mandatory** — S3-compatible, Vault-compatible abstractions |
| **Multi-region**                  | Platform Core v3 — active-active deferred                             |

Cloud is an **operational packaging** of self-hosted architecture, not a redesign.

---

## Self-hosted strategy

Self-hosted is the **default and authoritative** deployment model (Documents 004, 013, 014):

- PostgreSQL, Redis, Caddy, S3-compatible storage
- OSS observability stack optional behind connectors
- No telemetry phoning home without explicit operator consent
- Upgrade path: migration scripts + health probes + operations runbooks

**Coexistence:** Legacy `apz-stack` on same host (see `ENVIRONMENT.md`) until migration complete.

---

## Platform Core boundary

**Platform Core owns** (never product-duplicated):

- Runtime, Workbench, Identity, Authorization, Operations, Personalisation, Governance, Provisioning, Security
- Persistence platform schema, API framework, capability frameworks (Actions, Knowledge, Events, Notifications, Activity)
- Cross-cutting: audit, health, diagnostics, rate limiting foundation

**Products own:**

- Domain business logic (matters, trust journals, trades, accounts)
- Product persistence (with RLS)
- Product modules and Platform Services
- Product-specific compliance profiles

See [Product Portfolio Strategy](./APZHUB-Product-Portfolio-Strategy.md).

---

## Strategic sequencing

> **Owner-approved (2026-07-08):** See [PCS-001 Owner Approval](./PCS-001-owner-approval.md).

```text
PCS-001 Strategy                     ✅ Approved
        ↓
PCv2-01 Production SaaS Hardening     ← authorized (in progress gate)
        ↓
PCv2-02 Background Workers & Outbox
        ↓
M17 CI/CD, Release Engineering & E2E
        ↓
OSS Integration Waves 1–3 (Plane → Kimai → Paperless)
        ↓
OSS Waves 4–9 (Support → Testing → Analytics → Automation → Observability → Security)
        ↓
Law Platform production hardening + Trust Phase 2 (parallel where resourced)
        ↓
PCv2-04–10 (Vault, observability, gateway, commercial — as sprint guides approve)
        ↓
Financial Engine extraction (when preconditions met — not approved now)
        ↓
Exchange / Banking (when chartered — not approved now)
        ↓
Platform Core v3 planning
```

---

## Required strategic answers

### What should APZHUB become in five years?

A **unified enterprise workbench platform** — self-hosted first, multi-product, commercially viable, with invisible OSS backends and governed AI augmentation.

### Which capabilities define Platform Core?

Runtime, Workbench, Identity, Authorization, Operations, Personalisation, Governance, Provisioning, Security, Persistence (platform), API Framework, and capability frameworks (Actions, Knowledge/Search, Events, Notifications, Activity Timeline). Certified in PC-001.

### Which capabilities should never be outsourced?

Identity permissions model, tenant isolation policy, Workbench UX shell, API gateway enforcement, audit authority, security posture, manifest/registry system, and Platform Service orchestration layer.

### What should Platform Core v3 eventually contain?

Multi-region federation, marketplace runtime, advanced AI agent platform, external event bus, zero-downtime upgrades, and commercial entitlement engine at scale. See [Platform Core v2 Strategy](./APZHUB-Platform-Core-v2-Strategy.md) for v2→v3 bridge.

### What should be the first implementation milestone after strategy approval?

**PCv2-01 — Production SaaS Hardening** (CSP enforce, CI automation, app bootstrap consolidation, RLS audit, gateway rate limits).

---

## References

- [Platform Core v2 Strategy](./APZHUB-Platform-Core-v2-Strategy.md)
- [Product Portfolio Strategy](./APZHUB-Product-Portfolio-Strategy.md)
- [OSS Integration Strategy](./APZHUB-OSS-Integration-Strategy.md)
- [Build vs Buy Strategy](./APZHUB-Build-vs-Buy-Strategy.md)
- [Commercial Roadmap](./APZHUB-Commercial-Roadmap.md)
- [Engineering Roadmap](./APZHUB-Engineering-Roadmap.md)
- [AI Strategy](./APZHUB-AI-Strategy.md)
- [PCS-001 Strategy Review](../reviews/PCS-001-Strategy-Review.md)
