# APZHUB Document Map

> **Purpose:** Categorised map of all APZHUB documentation  
> **Audience:** All stakeholders  
> **Authoritative references:** [docs/README.md](../README.md) — complete registry with tables  
> **Related documents:** [PROJECT-INDEX](./PROJECT-INDEX.md)  
> **Reading order:** For finding documents by category  
> **Last updated:** 2026-07-19  
> **Current status:** **Operational Delivery**; Engineering Foundation **COMPLETE**; Operating Model **ACTIVE**; Product Engineering **ACTIVE**; [APZ Projects 1.1.0](../releases/projects/1.1.0/README.md) Production Release **ACCEPTED / CLOSED**; QA-002 **PRODUCTION READY**; Platform Foundation **CLOSED**; Integration SDK v1.0.0 frozen.

---

## Engineering Operations (`docs/operations/`) — APZHUB-OPERATIONS-001

| Document                                                                                                                                                                                | Purpose                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [README](../operations/README.md) · [ENGINEERING-OPERATING-MODEL](../operations/ENGINEERING-OPERATING-MODEL.md)                                                                         | Permanent operating handbook — **ACTIVE** |
| [RELEASE-MANAGEMENT-STANDARD](../operations/RELEASE-MANAGEMENT-STANDARD.md) · [BRANCHING-AND-VERSIONING](../operations/BRANCHING-AND-VERSIONING.md)                                     | Release / git / SemVer                    |
| [CHANGE-MANAGEMENT-STANDARD](../operations/CHANGE-MANAGEMENT-STANDARD.md) · [HOTFIX-POLICY](../operations/HOTFIX-POLICY.md)                                                             | Change & hotfix                           |
| [PRODUCTION-SUPPORT-STANDARD](../operations/PRODUCTION-SUPPORT-STANDARD.md) · [INCIDENT-MANAGEMENT-STANDARD](../operations/INCIDENT-MANAGEMENT-STANDARD.md)                             | Support & incidents                       |
| [DEFINITION-OF-READY](../operations/DEFINITION-OF-READY.md) · [DEFINITION-OF-DONE](../operations/DEFINITION-OF-DONE.md) · [CODE-REVIEW-STANDARD](../operations/CODE-REVIEW-STANDARD.md) | Ready / Done / review                     |
| [PRODUCT-LIFECYCLE](../operations/PRODUCT-LIFECYCLE.md) · [PLATFORM-LIFECYCLE](../operations/PLATFORM-LIFECYCLE.md)                                                                     | Lifecycles                                |
| [AI-ENGINEERING-OPERATIONS](../operations/AI-ENGINEERING-OPERATIONS.md)                                                                                                                 | AI operating rules                        |
| [APZHUB-OPERATIONS-001 Acceptance](./completion-reports/APZHUB-OPERATIONS-001-programme-acceptance-report.md)                                                                           | **ACCEPTED / CLOSED**                     |

---

## Releases (`docs/releases/`) — Operational Delivery

| Document                                                                                   | Purpose                                                                                                                                       |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [README](../releases/README.md)                                                            | Release home (Product / Platform)                                                                                                             |
| [PRODUCT-RELEASE-ROADMAP](../releases/PRODUCT-RELEASE-ROADMAP.md)                          | Per-product release posture                                                                                                                   |
| [PLATFORM-RELEASE-ROADMAP](../releases/PLATFORM-RELEASE-ROADMAP.md)                        | Platform versioning & cadence                                                                                                                 |
| [RELEASE-CALENDAR](../releases/RELEASE-CALENDAR.md)                                        | Release workflow (no dates)                                                                                                                   |
| [RELEASE-NAMING-STANDARD](../releases/RELEASE-NAMING-STANDARD.md)                          | SemVer · RC · hotfix · LTS · deprecation                                                                                                      |
| [APZ Projects 1.1.0 evidence](../releases/projects/1.1.0/README.md)                        | Current Production Release — **ACCEPTED / CLOSED**                                                                                            |
| [APZ Time 1.0.0](../releases/time/1.0.0/README.md)                                         | Production Release — **ACCEPTED / CLOSED**                                                                                                    |
| [APZ Support 2.0 planning](../releases/support/APZ-SUPPORT-2.0-READINESS-ASSESSMENT.md)    | Planning — **Awaiting Acceptance** · already Production                                                                                       |
| [APZ Time final IR](../releases/time/APZ-TIME-FINAL-READINESS-ASSESSMENT.md)               | APZHUB-TIME-READINESS-002 — **ACCEPTED / CLOSED** (historical IR)                                                                             |
| [APZ Time 1.0 planning](../releases/time/README.md)                                        | Historical planning suite — **ACCEPTED**                                                                                                      |
| [Kimai Integration Foundation](../integrations/kimai/README.md)                            | APZHUB-INTEGRATION-KIMAI-001 — **ACCEPTED / CLOSED** · foundation **0.1.0** (superseded by **0.2.0** domain)                                  |
| [Time Platform Services](../platform/time/README.md)                                       | APZHUB-PLATFORM-TIME-001 — **ACCEPTED / CLOSED** · [acceptance](./completion-reports/APZHUB-PLATFORM-TIME-001-programme-acceptance-report.md) |
| [Time HTTP API](../http/time/README.md)                                                    | APZHUB-TIME-HTTP-001 — **ACCEPTED / CLOSED** · OpenAPI **1.10.0**                                                                             |
| [Time IR reassessment](../releases/time/APZ-TIME-IMPLEMENTATION-READINESS-REASSESSMENT.md) | APZHUB-TIME-READINESS-001 — **ACCEPTED / CLOSED** (historical; superseded by READINESS-002)                                                   |
| [Kimai Integration](../integrations/kimai/README.md)                                       | APZHUB-INTEGRATION-KIMAI-002 — **ACCEPTED / CLOSED** · **CERTIFIED_DOMAIN** **0.2.0**                                                         |

---

## Product Engineering (`docs/products/`) — APZHUB-PRODUCTS-000

| Document                                                                                                                                                                                                                    | Category                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [README](../products/README.md) · [PRODUCT-ENGINEERING-HANDBOOK](../products/PRODUCT-ENGINEERING-HANDBOOK.md)                                                                                                               | Framework entry                                                                                        |
| [APZHUB-PRODUCT-PORTFOLIO](../products/APZHUB-PRODUCT-PORTFOLIO.md)                                                                                                                                                         | **Authoritative product portfolio & roadmap** (APZHUB-PRODUCTS-001)                                    |
| [APZHUB-PRODUCT-IMPLEMENTATION-READINESS-MATRIX](../products/APZHUB-PRODUCT-IMPLEMENTATION-READINESS-MATRIX.md) · [PORTFOLIO-READINESS-SUMMARY](../products/APZHUB-PRODUCT-PORTFOLIO-READINESS-SUMMARY.md)                  | Product Definition Packs / readiness (APZHUB-PRODUCTS-002 **ACCEPTED**)                                |
| [APZHUB-PRODUCT-READINESS-ADVANCEMENT](../products/APZHUB-PRODUCT-READINESS-ADVANCEMENT.md)                                                                                                                                 | Product evaluation + IR advancement (APZHUB-PRODUCTS-003)                                              |
| [APZHUB-PROJECTS-001 Acceptance](./completion-reports/APZHUB-PROJECTS-001-programme-acceptance-report.md) · [Completion](../sprint/APZHUB-PROJECTS-001-completion-report.md)                                                | First product implementation — **ACCEPTED / CLOSED**                                                   |
| [APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION](../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md)                                                                                                   | Product transition report + reusable implementation pattern                                            |
| [PRODUCT-LIFECYCLE](../products/PRODUCT-LIFECYCLE.md) · [PRODUCT-ARCHITECTURE-STANDARD](../products/PRODUCT-ARCHITECTURE-STANDARD.md)                                                                                       | Lifecycle / architecture                                                                               |
| [PRODUCT-BACKLOG-STANDARD](../products/PRODUCT-BACKLOG-STANDARD.md) · [PRODUCT-RELEASE-STANDARD](../products/PRODUCT-RELEASE-STANDARD.md) · [PRODUCT-CERTIFICATION-STANDARD](../products/PRODUCT-CERTIFICATION-STANDARD.md) | Delivery standards                                                                                     |
| [PRODUCT-DOCUMENT-MAP](../products/PRODUCT-DOCUMENT-MAP.md)                                                                                                                                                                 | Product navigation                                                                                     |
| Portfolio folders                                                                                                                                                                                                           | `projects/` · `time/` · `support/` · `documents/` · `analytics/` · `workflow/` · `law/` (placeholders) |

Complements Knowledge Foundation — does not replace it.

---

## Knowledge Foundation (`docs/foundation/`)

| Document                                                                                                                                      | Category                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [APZHUB-FOUNDATION-001 Platform Foundation Completion Report](./APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md)               | **Executive — Platform Foundation ACCEPTED / CLOSED**                                                                                                                                                                                                                        |
| [APZHUB-PHASE-3 Product Engineering Commencement](./APZHUB-PHASE-3-Product-Engineering-Commencement.md)                                       | **Executive — Phase 3 Owner Directive**                                                                                                                                                                                                                                      |
| APZHUB-MASTER-BRIEF, CONSTITUTION, VISION                                                                                                     | Executive                                                                                                                                                                                                                                                                    |
| ENGINEERING-HANDBOOK, ARCHITECTURE-HANDBOOK                                                                                                   | Engineering                                                                                                                                                                                                                                                                  |
| PLATFORM/PACKAGE/PRODUCT/OSS/INTEGRATION-CATALOGUE                                                                                            | Catalogues                                                                                                                                                                                                                                                                   |
| PROJECT-BIBLE                                                                                                                                 | Programme history                                                                                                                                                                                                                                                            |
| DECISION-REGISTER, ADR-CATALOGUE                                                                                                              | Decisions                                                                                                                                                                                                                                                                    |
| AI-MANIFEST, AI-BOOTSTRAP, SESSION-START, AI-CONTEXT, AI-ENGINEERING-STANDARDS, AI-WORKFLOW, CURRENT-STATE, CURRENT-MILESTONE, ACTIVE-BACKLOG | AI foundation (primary entry: AI-MANIFEST)                                                                                                                                                                                                                                   |
| CURRENT-STATE, CURRENT-MILESTONE, ACTIVE-BACKLOG                                                                                              | Status                                                                                                                                                                                                                                                                       |
| PROJECT-INDEX, DOCUMENT-MAP, REPOSITORY-GUIDE                                                                                                 | Navigation                                                                                                                                                                                                                                                                   |
| INTEGRATION-PRODUCT-CAPABILITY-INVENTORY                                                                                                      | Authoritative integration/product inventory (disk + KF)                                                                                                                                                                                                                      |
| `completion-reports/`                                                                                                                         | KF/programme completion, acceptance, recommendation, and QA reports (e.g. APZHUB-KF-001, OSS-100-12+, [APZHUB-QA-001](./completion-reports/APZHUB-QA-001-repository-production-quality-report.md), [APZHUB-QA-002](./completion-reports/APZHUB-QA-002-completion-report.md)) |

---

## Foundation documents (`docs/000–029`)

| Range                  | Category                                                                          |
| ---------------------- | --------------------------------------------------------------------------------- |
| 000                    | Engineering Constitution — **supreme authority**                                  |
| 001–002                | Vision, terminology                                                               |
| 003–004                | Architecture, technology stack                                                    |
| 005–006                | Desktop framework, design system                                                  |
| 007–013                | IAM, modules, services, API, data, events, security                               |
| 014–015                | Observability, quality                                                            |
| 016–023                | Shell, navigation, sessions, commands, search, notifications, themes, preferences |
| 024–029                | Platform SDK, Module SDK, Integration SDK, Service SDK, UI SDK, Event SDK         |
| `*-quick-reference.md` | Derived lookup tables                                                             |

---

## Architecture (`docs/architecture/`)

| Subcategory                                        | Examples                                                                                                                                                                                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform Core                                      | APZHUB-Platform-Core-Reference-Architecture.md, Capability Reference                                                                                                                                                          |
| Platform Outbox (PCv2-02)                          | [PCv2-02 Completion](../sprint/PCv2-02-completion-report.md), [PCv2-02 Sprint Guide](../sprint/PCv2-02-Outbox-Workers-Sprint-Guide.md), package `@apzhub/platform-outbox`                                                     |
| Frameworks                                         | command-framework.md, knowledge-discovery-framework.md, event-notification-framework.md                                                                                                                                       |
| Law Platform                                       | APZHUB-Law-Platform-Reference-Architecture.md, LAW-Trust-Reference-Architecture.md                                                                                                                                            |
| OSS Integration                                    | APZHUB-OSS-Integration-Master-Architecture.md, OSS Product Integration Catalog                                                                                                                                                |
| Integration SDK                                    | APZHUB-Platform-Integration-SDK-Architecture.md, Integration Authentication Architecture                                                                                                                                      |
| Projects                                           | APZHUB-Projects-Capability-Architecture.md, Projects Plane Reference Architecture                                                                                                                                             |
| APZ TCMS / CI/CD                                   | APZHUB-CICD-Reference-Adapter-Standard.md, APZHUB-APZ-TCMS-GitHub-Actions-_, APZHUB-APZ-TCMS-Engineering-Intelligence-_                                                                                                       |
| Integration SDK (Wave Freeze)                      | APZHUB-Integration-SDK-Architecture-Freeze-Notice.md, Integration SDK Reference Standard, Provider Development / Compatibility / Operational Readiness guides, OSS-100-11 reviews/sprint pack, ADR-0065, v1.0.0 Release Notes |
| Search Publication (Wave Freeze)                   | APZHUB-Search-Publication-Architecture-Freeze-Notice.md, Search Publication Reference Standard, Operational Readiness Guide, Future Search Publication Guide, APZSEARCH-019 reviews/sprint pack                               |
| Metrics (Wave Freeze)                              | APZHUB-Metrics-Architecture-Freeze-Notice.md, Metrics Reference Standard, Future Metrics Platform Guide, APZMETRICS-006 reviews/sprint pack                                                                                   |
| Metrics (Certification)                            | APZMETRICS-005 reviews pack, Platform Metrics Certification Guide, Operational Readiness Guide, Production Readiness                                                                                                          |
| Metrics (Workbench)                                | APZHUB-Metrics-Administration-Workbench-Architecture.md, Navigation/Views/Capability/Authorization/Testing guides                                                                                                             |
| Metrics (HTTP)                                     | APZHUB-Metrics-HTTP-API-Architecture.md, Route Catalogue, Typed Client / Security / Formula / KPI HTTP guides                                                                                                                 |
| Metrics (services)                                 | APZHUB-Metrics-Platform-Services-Architecture.md, Gateway/Authorization/Bootstrap/Metadata guides                                                                                                                             |
| Metrics (foundation)                               | APZHUB-Platform-Metrics-Architecture.md, APZHUB-Metrics-Domain-Model.md, KPI/Governance/Lifecycle/Validation guides                                                                                                           |
| Observability (frozen)                             | APZHUB-Observability-Architecture-Freeze-Notice.md, APZHUB-Observability-Reference-Standard.md, Platform Observability Architecture                                                                                           |
| Administration / Identity / Configuration (frozen) | *-Architecture-Freeze-Notice.md, *-Reference-Standard.md                                                                                                                                                                      |
| Security & ops                                     | APZHUB-Session-Security-Architecture.md, Platform Operations Control Plane                                                                                                                                                    |
| Patterns                                           | APZHUB-Platform-Design-Patterns.md, Capability Abstraction Standard                                                                                                                                                           |
| Baselines                                          | APZHUB-Architecture-Baseline-v1.0.md (frozen)                                                                                                                                                                                 |

Index: [LAW Architecture Index](../architecture/LAW-Architecture-Index.md)

---

## Architecture decisions (`docs/adr/`)

**65** ADR files (`ADR-0001` … `ADR-0065`) + legacy decisions in `docs/decisions/`.

Index: [ADR README](../adr/README.md) · [ADR-CATALOGUE](./ADR-CATALOGUE.md)

---

## Strategy (`docs/strategy/`)

| Document                             | Topic                  |
| ------------------------------------ | ---------------------- |
| APZHUB-Platform-Core-Strategy.md     | Master strategy        |
| APZHUB-Product-Portfolio-Strategy.md | Product classification |
| OSS-001 Master Plan                  | OSS integration        |
| APZHUB-Build-vs-Buy-Strategy.md      | Sourcing               |
| APZHUB-Commercial-Roadmap.md         | Commercial tiers       |
| APZHUB-Engineering-Roadmap.md        | Engineering priorities |
| APZHUB-AI-Strategy.md                | AI governance          |

Index: [strategy/README.md](../strategy/README.md)

---

## Specifications (`docs/specs/`)

| Area                       | Examples                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| SPR-004 Action Framework   | SPR-004-spec-index.md                                              |
| SPR-005 Knowledge          | SPR-005-spec-index.md                                              |
| SPR-006 Event/Notification | SPR-006-spec-index.md                                              |
| SPR-007 Activity/Timeline  | SPR-007-spec-index.md                                              |
| Law API                    | LAW-API-Design-Standard.md, LAW-OpenAPI-v1.yaml                    |
| Projects                   | APZHUB-ProjectService-Specification.md, PlaneAdapter Specification |
| Integration SDK            | APZHUB-Adapter-SDK-Specification.md                                |

---

## Backlogs (`docs/backlog/`)

| Backlog                                     | Status               |
| ------------------------------------------- | -------------------- |
| PCv2-01-Backlog.md                          | PRH-001–011 complete |
| OSS-100-Platform-Integration-SDK-Backlog.md | 100-01/02 complete   |
| OSS-101-Plane-Integration-Backlog.md        | 101-01–03 complete   |
| LAW-Platform-Backlog.md                     | Closed               |
| LAW-015-Trust-Accounting-Backlog.md         | Closed               |
| APZHUB-Quality-Engineering-Backlog.md       | Planned              |
| SPR-004–007 backlogs                        | Complete             |

Index: [ACTIVE-BACKLOG](./ACTIVE-BACKLOG.md)

---

## Sprint & completion reports (`docs/sprint/`)

100+ completion reports covering BUILD-001, SPR-001–008, M8, PCv2-01 (PRH-000–011), LAW-001–015, PCS-001, OSS-001–002, OSS-100-01/02, OSS-101-01–03, APZHUB-000.

---

## Reviews (`docs/reviews/`)

| Category          | Examples                                                                        |
| ----------------- | ------------------------------------------------------------------------------- |
| Milestone reviews | MILESTONE-002 through MILESTONE-007                                             |
| Platform reviews  | APZHUB-v5.0-Platform-Review.md, APZHUB-v6.0-Architecture-Review.md              |
| Certification     | APZHUB-Platform-Core-Certification.md, APZHUB-Platform-Core-v2-Certification.md |
| Readiness         | PCv2-01-Readiness-Review.md, OSS-101-Readiness-Review.md                        |
| Compliance        | APZHUB-Architecture-Compliance-Report.md (PRH-011)                              |
| Product           | APZHUB-Law-Platform-Readiness.md, FIN-001-Architecture-Review.md                |

---

## Governance (`docs/governance/`)

Engineering Handbook, Capability Development Guide, Workbench Development Guide, OSS Integration Standards, Security Operations Guide, Incident Response Guide, Configuration Developer Guide, Environment Governance.

---

## Security (`docs/security/`)

CSP Audit, HTTP Header Compliance Report, CSP Violation Reporting.

---

## Developer guides (`docs/developer/`)

Action framework onboarding, knowledge discovery onboarding, event notification onboarding, activity timeline onboarding, platform personalisation onboarding, platform governance onboarding, operations dashboard guide, platform lifecycle developer guide.

---

## Operator guides (`docs/operator/`)

LAW Trust Operations Guide.

---

## Roadmaps (`docs/roadmap/`)

APZHUB-Platform-Core-v2-Roadmap.md, APZHUB-Platform-Roadmap-v2.md, LAW-Persistence-Roadmap.md.

---

## Releases (`docs/releases/`)

APZHUB-Platform-v4.0.md, v5.0, v6.0, Law Platform v1.0, LAW Trust v1.0, PRH-000 Sprint Baseline, versioned release notes (v0.1.0–v0.7.0 prepared).

---

## Build guides (`docs/build/`)

BUILD-001 Repository Bootstrap Guide.

---

## Products (in documentation)

| Product          | Primary docs                              |
| ---------------- | ----------------------------------------- |
| Platform Core    | architecture/APZHUB-Platform-Core-*       |
| Law Platform     | architecture/APZHUB-Law-_, backlog/LAW-_  |
| Trust Accounting | architecture/LAW-Trust-_, LAW-015-_       |
| Projects         | architecture/APZHUB-Projects-_, OSS-101-_ |
| Integration SDK  | packages/integration-sdk/docs/, OSS-100-* |

---

## Package documentation (`packages/*/docs/`)

| Package                     | Docs                                                   |
| --------------------------- | ------------------------------------------------------ |
| integration-sdk             | AUTHENTICATION.md, CONNECTION-MANAGEMENT.md, README.md |
| activity-timeline-framework | ACTIVITY-SESSION-STORE.md, TIMELINE-QUERY.md           |

---

## Root-level

| File                                   | Purpose         |
| -------------------------------------- | --------------- |
| [CHANGELOG.md](../../CHANGELOG.md)     | Release history |
| [ENVIRONMENT.md](../../ENVIRONMENT.md) | Host inventory  |
