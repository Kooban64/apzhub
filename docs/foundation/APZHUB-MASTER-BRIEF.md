# APZHUB Master Brief

> **Purpose:** Executive overview of the complete APZHUB programme  
> **Audience:** Owners, architects, new engineers, AI agents  
> **Authoritative references:** [000 — Engineering Constitution](../000-apzhub-engineering-constitution.md) · [001 — Vision](../001-project-vision-and-guiding-principles.md) · [Platform Core Strategy](../strategy/APZHUB-Platform-Core-Strategy.md)  
> **Related documents:** [APZHUB-VISION](./APZHUB-VISION.md) · [PROJECT-INDEX](./PROJECT-INDEX.md) · [CURRENT-STATE](./CURRENT-STATE.md)  
> **Reading order:** Read after [APZHUB-CONSTITUTION](./APZHUB-CONSTITUTION.md); before deep architecture  
> **Last updated:** 2026-07-10  
> **Current status:** Active — Knowledge Foundation (APZHUB-000)

---

## Vision

APZHUB is an **Enterprise Operating Platform** — a single, unified workbench through which users access enterprise capabilities without exposure to underlying backend engines. Users interact only with APZHUB. Backend products are implementation details.

See [001 — Project Vision](../001-project-vision-and-guiding-principles.md).

---

## Mission

Build a modern, self-hosted, enterprise-grade platform that:

- Integrates best-of-breed open-source software behind adapters
- Presents one consistent desktop-style user experience
- Remains modular and replaceable
- Evolves without architectural redesign
- Is maintainable for many years

---

## Platform philosophy

| Principle | Meaning |
|-----------|---------|
| **Platform first** | Infrastructure and architecture before business features |
| **Self-hosted first** | OSS Community Edition preferred; commercial only with justification |
| **Backend agnostic** | Users never see engine names (Plane, Kimai, etc.) |
| **Workbench is APZHUB** | One shell; no isolated module layouts |
| **Manifest first** | Contract before code — modules, services, integrations, events |
| **Planning precedes implementation** | Sprint guides, ADRs, specs before coding |

---

## Long-term objectives

1. **Platform Core** — certified cross-cutting capabilities (identity, authz, ops, security, lifecycle)
2. **Product portfolio** — Law Platform (commercial), productivity modules (OSS-backed), future verticals
3. **Integration SDK** — canonical adapter framework for all OSS engines
4. **Quality Engineering** — native test management capability (Wave 5)
5. **Commercial evolution** — internal → pilot → enterprise → SaaS → marketplace

See [Platform Core Strategy](../strategy/APZHUB-Platform-Core-Strategy.md) · [Commercial Roadmap](../strategy/APZHUB-Commercial-Roadmap.md).

---

## Product portfolio

| Product | Type | Status |
|---------|------|--------|
| **Platform Core** | Core | v2 **CERTIFIED WITH OBSERVATIONS** (PRH-011) |
| **Law Platform** | Vertical product | Validation advanced — LAW-001–015 closed |
| **Trust Accounting** | Law capability | Milestone closed (LAW-015) |
| **Financial Engine** | Shared engine | **DEFER EXTRACTION** (FIN-001) |
| **Projects** (Plane OSS) | Productivity module | Planning complete; OSS-101-03 manifests done |
| **Documents, Time, Support, Analytics, Automation, Testing** | Productivity modules | Planned — OSS Wave 2–9 |
| **Quality Engineering** | Native capability | Planned — QE-001–015 backlog |

See [Product Catalogue](./PRODUCT-CATALOGUE.md) · [Product Portfolio Strategy](../strategy/APZHUB-Product-Portfolio-Strategy.md).

---

## Platform Core overview

Platform Core delivers manifest-driven runtime, workbench shell, identity, authorization, operations, personalisation, governance, security, bootstrap, lifecycle, and reliability validation.

**Canonical reference:** [Platform Core Reference Architecture](../architecture/APZHUB-Platform-Core-Reference-Architecture.md)

**Certification:** [Platform Core v2 Certification](../reviews/APZHUB-Platform-Core-v2-Certification.md) — CERTIFIED WITH OBSERVATIONS

---

## Current implementation status

| Area | Status |
|------|--------|
| Foundation docs (000–029) | Complete |
| BUILD-001 + SPR-001 | Complete |
| Milestones M2–M7 (Runtime → Activity Timeline) | Complete |
| Platform Core v1 (M8, PC-001) | CERTIFIED WITH OBSERVATIONS |
| Platform Core v2 (PCv2-01, PRH-001–011) | CERTIFIED WITH OBSERVATIONS |
| Law Platform + Trust Accounting | Milestone closed |
| PCS-001 Strategy | Complete |
| OSS-001 Master Plan | Complete |
| OSS-100 Integration SDK | Planning complete; OSS-100-01/02 implemented (v0.2.0) |
| OSS-101 Projects / Plane | Planning + manifests complete; adapter not started |

See [CURRENT-STATE](./CURRENT-STATE.md) · [CURRENT-MILESTONE](./CURRENT-MILESTONE.md).

---

## Completed milestones (selected)

| Milestone | Outcome |
|-----------|---------|
| BUILD-001 | Monorepo bootstrap |
| SPR-001 | Foundation shell, auth scaffold, Docker |
| SPR-002–007 | Runtime, Workbench, Actions, Knowledge, Events, Activity Timeline |
| M8 / PC-001 | Identity, Authz, Ops, Personalisation, Governance, Security |
| PCv2-01 (PRH-000–011) | Production readiness, certification |
| LAW-015 | Trust Accounting closed |
| PCS-001 | Master strategy ratified |
| OSS-001, OSS-002, OSS-100, OSS-101 | Integration planning complete |
| OSS-100-01, OSS-100-02 | Integration SDK scaffold + auth/connection foundation |

Full history: [PROJECT-BIBLE](./PROJECT-BIBLE.md) · [docs/sprint/](../sprint/)

---

## Current roadmap

**Immediate stop:** APZHUB-000 Knowledge Foundation complete → await owner approval.

**Next approved implementation (pending owner):** OSS-100-04 — Error translation & observability.

**Sequencing (owner-ratified):** PCv2-02 → M17 → OSS-100-04 → OSS-101-04 (requires OSS-100-05) / QE-001.

See [Engineering Roadmap](../strategy/APZHUB-Engineering-Roadmap.md) · [OSS Wave Roadmap](../strategy/APZHUB-OSS-Wave-Roadmap.md).

---

## Engineering philosophy

- **Architecture before coding** — layered model, no bypassing
- **Documentation is mandatory** — specs, ADRs, completion reports
- **Testing is mandatory** — full pyramid; CI every commit
- **Security by design** — Zero Trust on every request
- **Tenant isolation by design** — scoped data and connections
- **Backward compatibility** — where practical; semver for SDKs

See [015 — Quality Framework](../015-software-quality-testing-qa-cicd-release-management-framework.md).

---

## Build vs Buy philosophy

| Approach | When |
|----------|------|
| **Build (native)** | Platform Core, Law Platform, Quality Engineering, Financial Engine (future) |
| **Integrate (OSS adapter)** | Projects, Documents, Time, Support, Analytics, Automation, Testing |
| **Buy (commercial)** | Only with documented business justification |
| **Defer** | Financial Engine extraction, SaaS marketplace, unchartered verticals |

See [Build vs Buy Strategy](../strategy/APZHUB-Build-vs-Buy-Strategy.md) · [OSS vs Native Decision Model](../architecture/APZHUB-OSS-vs-Native-Capability-Decision-Model.md).

---

## Platform principles (summary)

1. Platform Core owns cross-cutting capabilities
2. Products consume Platform capabilities — never duplicate
3. Vendor systems hidden behind adapters
4. Identity, authorization, governance are Platform-owned
5. Capability services never handle vendor credentials directly
6. Events drive notifications, search, audit — modules do not bypass

See [APZHUB-CONSTITUTION](./APZHUB-CONSTITUTION.md) · [003 — Architecture](../003-overall-system-architecture-design-principles.md).

---

## Future direction

- Complete Integration SDK (OSS-100-03 through 100-10)
- Plane adapter and Projects module (OSS-101-04+, after OSS-100-05)
- Remaining OSS waves (Kimai, Paperless, Zammad, Metabase, n8n, Kiwi TCMS, security tools)
- PCv2-02+ (workers, CI hardening, vault, HA)
- Quality Engineering native capability
- Commercial GA tiers

See [APZHUB-VISION](./APZHUB-VISION.md) · [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md).

---

## How new developers should approach the project

1. Read [APZHUB-CONSTITUTION](./APZHUB-CONSTITUTION.md) and [000](../000-apzhub-engineering-constitution.md)
2. Read this Master Brief
3. Read [AI-CONTEXT](./AI-CONTEXT.md) (if using AI assistance)
4. Read [ENGINEERING-HANDBOOK](./ENGINEERING-HANDBOOK.md) and [REPOSITORY-GUIDE](./REPOSITORY-GUIDE.md)
5. Read foundation docs 001–029 relevant to your work area
6. Check [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) before implementing anything
7. Follow sprint guides and stop at sprint boundaries

---

## Reading order

```text
APZHUB-CONSTITUTION → APZHUB-MASTER-BRIEF → AI-CONTEXT
        ↓
ENGINEERING-HANDBOOK + ARCHITECTURE-HANDBOOK
        ↓
Domain-specific foundation docs (001–029) + ADRs
        ↓
Sprint guide / backlog for approved work only
```
