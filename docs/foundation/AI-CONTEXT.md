# APZHUB AI Context

> **Purpose:** Platform rules, naming, constraints, and milestone catalogue for AI agents  
> **Audience:** AI coding agents (Cursor, ChatGPT, Claude, Gemini, Copilot, etc.)  
> **Primary AI entry:** [AI-MANIFEST](./AI-MANIFEST.md) — then [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) · [AI-BOOTSTRAP](./AI-BOOTSTRAP.md)  
> **Authoritative references:** [000](../000-apzhub-engineering-constitution.md) · [APZHUB-CONSTITUTION](./APZHUB-CONSTITUTION.md) · [CURRENT-MILESTONE](./CURRENT-MILESTONE.md)  
> **Related documents:** [AI-ENGINEERING-STANDARDS](./AI-ENGINEERING-STANDARDS.md) · [AI-WORKFLOW](./AI-WORKFLOW.md) · [CURRENT-STATE](./CURRENT-STATE.md) · [SESSION-START](./SESSION-START.md)  
> **Reading order:** After AI-MANIFEST + CURRENT-MILESTONE  
> **Last updated:** 2026-07-18  
> **Current status:** Active — **Phase 3 Product Engineering**. Platform Foundation **CLOSED** (FOUNDATION-001 **ACCEPTED**). **APZHUB-KF-002 / KF-001 COMPLETE**. Integration SDK **v1.0.0** frozen. **No product programme authorised** — do not recommend/bootstrap until Owner Approval.

---

## Instruction to AI agents

Before proposing architecture, writing code, or starting any milestone:

1. Read [AI-MANIFEST](./AI-MANIFEST.md) — primary bootstrap
2. Read [CURRENT-MILESTONE](./CURRENT-MILESTONE.md) — verify work is approved
3. Read [AI-BOOTSTRAP](./AI-BOOTSTRAP.md) for full procedure and checklists
4. Read this document
5. Read [APZHUB-CONSTITUTION](./APZHUB-CONSTITUTION.md)
6. Read relevant foundation docs (001–029) for your area
7. Read the sprint guide / backlog for the approved milestone
8. Follow [AI-WORKFLOW](./AI-WORKFLOW.md)

**Do not rely on historical chat threads.** The repository and Knowledge Foundation are the source of truth.

---

## Platform philosophy

- APZHUB is an **Enterprise Operating Platform** — one workbench, hidden backends
- **Platform first** — infrastructure before business features
- **Self-hosted OSS first** — Community Edition; commercial only with justification
- **Manifest first** — YAML contract before TypeScript implementation
- **Planning precedes implementation** — no coding without approved sprint scope

---

## Architecture principles

```text
Presentation → Application → Domain → Services → Adapters → Backend Engines
```

| Rule                                       | Detail                                      |
| ------------------------------------------ | ------------------------------------------- |
| Modules call Platform Services only        | Never connectors or backends                |
| Services call Integration SDK / connectors | Never skip adapter layer                    |
| Credentials stay in integration boundary   | Service → Adapter → SDK → Auth → Connection |
| Events drive side effects                  | No direct notify/search/audit from modules  |
| Tenant-scoped everything                   | Connections, data, operations               |
| Permission-driven UI                       | Server is authoritative                     |

---

## Coding principles

- TypeScript strict — no `any`
- Match existing conventions in target package
- Minimal diff — do not refactor unrelated code
- Tokens only in UI — no hardcoded colours/spacing
- Structured errors — no raw backend errors to users
- No secrets in logs, errors, diagnostics, or events

---

## Naming standards

| Context           | Convention                   | Example                                           |
| ----------------- | ---------------------------- | ------------------------------------------------- |
| User-facing       | APZHUB names                 | Projects, Documents, Time Tracking                |
| Platform Services | `{Domain}Service`            | `ProjectService`, `DocumentService`               |
| Adapters          | `{Engine}Adapter` (internal) | `PlaneAdapter` — never in UI                      |
| Packages          | `@apzhub/{name}`             | `@apzhub/platform-runtime`                        |
| Manifests         | `{type}.yaml`                | `module.yaml`, `service.yaml`, `integration.yaml` |
| Events            | Past tense                   | `project.created`, `matter.opened`                |
| Product name      | APZHUB                       | Never "portal" or "launcher"                      |

See [002 — Terminology](../002-product-naming-positioning-terminology-standard.md).

---

## Build vs Buy decisions

| Build (native)                         | Integrate (OSS adapter)                |
| -------------------------------------- | -------------------------------------- |
| Platform Core                          | Projects (Plane)                       |
| Law Platform                           | Time Tracking (Kimai)                  |
| Trust Accounting                       | Documents (Paperless)                  |
| **APZ TCMS** (Testing & Certification) | Support (Zammad)                       |
| Financial Engine (deferred)            | Analytics (Metabase), Automation (n8n) |

~~Quality Engineering / Kiwi Testing wave as product SoR~~ — **superseded** by APZ TCMS (ADR-0059). Result engines (Vitest, Playwright, …) remain external integration targets.

---

## Current milestones

| Milestone                                                                  | Status                                                                                                                                                                        |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation docs 000–029                                                    | Complete                                                                                                                                                                      |
| BUILD-001, SPR-001–007                                                     | Complete                                                                                                                                                                      |
| Platform Core v1 (M8) + PC-001                                             | CERTIFIED WITH OBSERVATIONS                                                                                                                                                   |
| Platform Core v2 (PRH-001–011)                                             | CERTIFIED WITH OBSERVATIONS                                                                                                                                                   |
| Law Platform + Trust (LAW-015)                                             | Milestone closed                                                                                                                                                              |
| PCS-001 Strategy                                                           | Complete                                                                                                                                                                      |
| OSS-001, OSS-002, OSS-100, OSS-101                                         | Planning complete                                                                                                                                                             |
| OSS-100-01–05                                                              | Complete (`@apzhub/integration-sdk` through v0.5.0)                                                                                                                           |
| **OSS-100-06 (Shared HTTP Transport)**                                     | **Complete** (`@apzhub/integration-sdk` **v0.6.0**)                                                                                                                           |
| **OSS-100-07 (Mapping Provider Framework)**                                | **Complete** (`@apzhub/integration-sdk` **v0.7.0**)                                                                                                                           |
| **OSS-100-08 (Webhook & polling contracts)**                               | **Complete** (`@apzhub/integration-sdk` **v0.8.0**)                                                                                                                           |
| **OSS-100-09 (Harness & Certification)**                                   | **Complete** (`@apzhub/integration-sdk` **v0.9.0**)                                                                                                                           |
| **PCv2-02 (Outbox Workers & Event Replay)**                                | **Complete** — `@apzhub/platform-outbox` **0.1.0**; `pnpm audit:platform-outbox`                                                                                              |
| **APZHUB-KF-002 (AI Bootstrap Manifest)**                                  | **Complete** — AI-MANIFEST + AI-BOOTSTRAP (docs only)                                                                                                                         |
| **APZHUB-KF-001 (Knowledge Foundation Reconciliation)**                    | **Complete** — documentation only; KF aligned to repository                                                                                                                   |
| **OSS-100-11 (SDK v1.0.0 Wave Freeze)**                                    | **Complete** — `@apzhub/integration-sdk` **1.0.0** · **Architecture Frozen**; `pnpm certify:integration-sdk`                                                                  |
| **OSS-100-10 (SDK v1.0 Certification)**                                    | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**; remained **0.9.0** until OSS-100-11                                                                                     |
| **APZTCMS-001 (APZ TCMS Vision & Architecture)**                           | **Complete** — docs only                                                                                                                                                      |
| **APZTCMS-002 (APZ TCMS Core Platform Foundation)**                        | **Complete** — `@apzhub/testing-contracts` / `testing-foundation` **0.1.0**                                                                                                   |
| **APZTCMS-003 (APZ TCMS Domain Persistence & Permissions)**                | **Complete** — `@apzhub/testing-persistence` **0.1.0**; schema + RLS                                                                                                          |
| **APZTCMS-004 (APZ TCMS Manual Test Management / domain services)**        | **Complete** — `@apzhub/testing-services` **0.1.0**; contracts/persistence **0.2.0**                                                                                          |
| **APZTCMS-005 (APZ TCMS Production Persistence Completion)**               | **Complete** — `@apzhub/testing-persistence` **0.3.0**; full Postgres; migrations `0020`/`0021`                                                                               |
| **APZTCMS-006 (Manual Execution & Evidence Domain Engine)**                | **Complete** — services **0.2.0**; contracts **0.3.0**; persistence **0.4.0**                                                                                                 |
| **APZTCMS-007 (Automation Result Ingestion Domain)**                       | **Complete** — services **0.3.0**; contracts **0.4.0**; persistence **0.5.0**                                                                                                 |
| **APZTCMS-008 (Quality Intelligence Domain)**                              | **Complete** — services **0.4.0**; contracts **0.5.0**; persistence **0.6.0**                                                                                                 |
| **APZTCMS-010 (Workbench UI)**                                             | **Complete** — presentation-only UI; module enabled; mock client                                                                                                              |
| **APZTCMS-011 (Testing Platform Services & Gateway)**                      | **Complete** — platform **0.8.0**; `gateway.testing.*`                                                                                                                        |
| **APZTCMS-012 (Testing HTTP API, OpenAPI & Typed Client)**                 | **Complete** — `/api/v1/testing/**`; production HTTP client                                                                                                                   |
| **APZTCMS-013 (Vertical-Slice Certification & Production Readiness)**      | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**                                                                                                                          |
| **APZTCMS-014 (Release & Quality Governance Domain)**                      | **Complete** — TCMS release governance; `gateway.testing.releaseGovernance`                                                                                                   |
| **APZTCMS-015 (External CI/CD Integration Framework)**                     | **Complete** — `gateway.testing.pipelines`; Generic CI parse-only                                                                                                             |
| **APZTCMS-016 (GitHub Actions Reference Adapter)**                         | **Complete** — `@apzhub/integration-github-actions` **0.1.0**                                                                                                                 |
| **APZTCMS-017 (GitHub Actions Platform Service Integration)**              | **Complete** — providers + `gateway.testing.pipeline*`                                                                                                                        |
| **APZTCMS-018 (GitHub Actions User Experience)**                           | **Complete** — HTTP `/api/v1/testing/pipelines` + workbench                                                                                                                   |
| **APZTCMS-019 (GitHub Actions Vertical Certification)**                    | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**                                                                                                                          |
| **APZTCMS-020 (GitHub Actions Wave Closeout)**                             | **Complete** — official CI/CD Reference Adapter frozen                                                                                                                        |
| **APZTCMS-021 (Engineering Intelligence)**                                 | **Complete** — domain services                                                                                                                                                |
| **APZTCMS-022 (EI HTTP API & Workbench)**                                  | **Complete** — HTTP + typed client + workbench                                                                                                                                |
| **APZDOCS-001 (Platform Document Foundation)**                             | **Complete** — `@apzhub/document-contracts` / `document-core` / `document-persistence` foundation                                                                             |
| **APZDOCS-002 (Production Persistence & Storage Providers)**               | **Complete** — contracts/core/persistence **0.2.0**; `@apzhub/document-storage` **0.1.0**; migrations 0039/0040                                                               |
| **APZDOCS-006 (Document Vertical Certification)**                          | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**; architecture frozen                                                                                                     |
| **APZSEARCH-001 (Platform Search Foundation)**                             | **Complete** — `@apzhub/search-contracts` (lifecycle extended in 002)                                                                                                         |
| **APZSEARCH-004 (Search Integration SDK)**                                 | **Complete** — `@apzhub/integration-search-sdk` **0.1.0**                                                                                                                     |
| **APZSEARCH-005 (Meilisearch Reference Adapter)**                          | **Complete** — `@apzhub/integration-meilisearch` **0.1.0**                                                                                                                    |
| **APZSEARCH-019 (Search Publication Wave Freeze)**                         | **Complete** — programme **closed / Architecture Frozen**; `pnpm audit:search-publication-wave`; Reference Standard + Freeze Notice                                           |
| **APZSEARCH-018 (Publication Reliability Certification)**                  | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**; `pnpm certify:search-publication`; ecosystem 009–017 certified; no runtime delta                                        |
| **APZSEARCH-017 (Publication Operations & Administration)**                | **Complete** — `@apzhub/search-publication-admin` **0.1.0**; HTTP `/api/v1/search/publication/*`; Workbench Publication Ops; `audit:search-publication-admin`                 |
| **APZSEARCH-016 (Product Indexing Orchestration)**                         | **Complete** — `@apzhub/search-orchestrator` **0.1.0**; durable PG journal + retry/batch/dedupe; hooks via composition; `audit:search-orchestrator`; migrations **0058/0059** |
| **APZSEARCH-015 (Search Publication Certification)**                       | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**; Framework + five product adapters certified                                                                             |
| **APZSEARCH-014 (Reporting Search Publication Adapter)**                   | **Complete** — `@apzhub/search-reporting` **0.1.0**; Reporting → Search Integration Framework (metadata-only)                                                                 |
| **APZSEARCH-013 (APZ TCMS Search Publication Adapter)**                    | **Complete** — `@apzhub/search-testing` **0.1.1**; TCMS → Search Integration Framework (metadata-only)                                                                        |
| **APZSEARCH-012 (Documents Search Publication Adapter)**                   | **Complete** — `@apzhub/search-documents` **0.1.0**; Documents → Search Integration Framework (metadata-only)                                                                 |
| **APZSEARCH-011 (Support Search Publication Adapter)**                     | **Complete** — `@apzhub/search-support` **0.1.0**; Support → Search Integration Framework                                                                                     |
| **APZSEARCH-010 (Projects Search Publication Adapter)**                    | **Complete** — `@apzhub/search-projects` **0.1.0**; Projects → Search Integration Framework                                                                                   |
| **APZSEARCH-009 (Cross-Product Search Integration Framework)**             | **Complete** — `@apzhub/search-integration` **0.2.0** (016 bump); product contracts only; Search Platform frozen                                                              |
| **APZSEARCH-008 (Search Vertical Certification)**                          | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**; architecture frozen at APZSEARCH-007                                                                                    |
| **APZSEARCH-007 (Search HTTP & Workbench)**                                | **Complete** — OpenAPI **1.1.0** / ADR-0064                                                                                                                                   |
| **APZSEARCH-003 (Gateway & Authorization Integration)**                    | **Complete** — platform-services **0.17.0**; contracts **0.3.0**; persistence **0.2.0**                                                                                       |
| **APZSEARCH-002 (Search Persistence & Provider Framework)**                | **Complete** — `@apzhub/search-persistence` **0.2.0**; migrations 0041/0042/0043                                                                                              |
| **APZDOCS-005 (Document Workbench)**                                       | **Complete** — `/workspace/documents` manifests + read-only UI over typed client                                                                                              |
| **APZDOCS-004 (Document HTTP API & Typed Client)**                         | **Complete** — `/api/v1/documents` + OpenAPI + `createHttpDocumentClient()`                                                                                                   |
| **APZDOCS-003 (Document Platform Services, Gateway & Authorization)**      | **Complete** — contracts/core **0.3.0**; `@apzhub/platform-services` **0.16.0**; gateway facets + authz                                                                       |
| **APZREPORT-003 (Reporting Vertical Certification)**                       | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**                                                                                                                          |
| **APZREPORT-002 (Platform Reporting HTTP & Workbench)**                    | **Complete** — `/api/v1/reporting` + workbench                                                                                                                                |
| **APZREPORT-001 (Platform Reporting Foundation)**                          | **Complete** — `@apzhub/reporting-contracts` + `@apzhub/reporting-core`                                                                                                       |
| **APZCONFIG-006 (Configuration Wave Certification & Architecture Freeze)** | **Complete** — programme **closed/frozen**; **PRODUCTION_READY_WITH_LIMITATIONS** retained; Reference Standard                                                                |
| **APZMETRICS-006 (Wave Certification & Architecture Freeze)**              | **Complete** — programme **closed/frozen**; `audit:metrics-wave`; Reference Standard published                                                                                |
| **APZMETRICS-005 (Vertical Certification)**                                | **Complete** — `certify:metrics-vertical`; **PRODUCTION_READY_WITH_LIMITATIONS** retained                                                                                     |
| **APZMETRICS-004 (Administration Workbench)**                              | **Complete** — `audit:metrics-workbench`; `/workspace/metrics`; `platform-metrics` order **55**                                                                               |
| **APZMETRICS-003 (HTTP API & Typed Client)**                               | **Complete** — `audit:metrics-http-client`; OpenAPI **1.9.0**; `/api/v1/metrics/*`; `apps/web/lib/metrics`                                                                    |
| **APZMETRICS-002 (Platform Services / Gateway / Authz)**                   | **Complete** — `audit:metrics-platform-services`; contracts/core **0.2.0**; platform-services **0.26.1**; `gateway.metrics.*`                                                 |
| **APZMETRICS-001 (Platform Metrics Foundation)**                           | **Complete** — `audit:metrics-foundation`; contracts/core/persistence **0.1.0→0.2.0/0.1.0**; migrations **0056/0057**                                                         |
| **APZOBSERVE-006 (Observability Wave Freeze)**                             | **Complete** — programme **closed/frozen**; `audit:observe-wave`; Reference Standard                                                                                          |
| **APZOBSERVE-005 (Observability Vertical Certification)**                  | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**; `certify:observe-vertical`                                                                                              |
| **APZOBSERVE-004 (Observability Administration Workbench)**                | **Complete** — `/workspace/observability`; `platform-observability` manifests; `audit:observe-workbench`                                                                      |
| **APZOBSERVE-003 (Observability HTTP API & Production Typed Client)**      | **Complete** — `/api/v1/observe/*`; `apps/web/lib/observe`; OpenAPI **1.8.0**; `audit:observe-http-client`                                                                    |
| **APZOBSERVE-002 (Platform Services, Gateway & Authorization)**            | **Complete** — `gateway.observe.*`; observe-contracts/core **0.2.0**; platform-services **0.24.0**; `audit:observe-platform-services`                                         |
| **APZOBSERVE-001 (Platform Observability Foundation)**                     | **Complete** — `@apzhub/observe-persistence` **0.1.0**; migrations **0054/0055**; `audit:observe-foundation`                                                                  |
| **APZIDENTITY-006 (Identity Wave Freeze)**                                 | **Complete** — programme **closed/frozen**; `audit:identity-wave`; Identity frozen (ADR + owner for further Identity)                                                         |
| **APZIDENTITY-005 (Identity Vertical Certification)**                      | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**; `audit:identity-vertical` / `certify:identity-vertical`                                                                 |
| **APZIDENTITY-004 (Identity Administration Workbench)**                    | **Complete** — `/workspace/identity`; `platform-identity` manifests; `audit:identity-workbench`                                                                               |
| **APZIDENTITY-003 (Identity HTTP API & Production Typed Client)**          | **Complete** — `/api/v1/identity/*`; `apps/web/lib/identity`; OpenAPI **1.7.0**; `audit:identity-http-client`                                                                 |
| **APZIDENTITY-002 (Platform Services, Gateway & Authorization)**           | **Complete** — `gateway.identity.*`; identity-contracts/core **0.2.0**; platform-services **0.23.0**; `audit:identity-platform-services`                                      |
| **APZIDENTITY-001 (Identity Administration Foundation)**                   | **Complete** — `@apzhub/identity-persistence` **0.1.0**; migrations **0052/0053**; `audit:identity-foundation`                                                                |
| **APZADMIN-006 (Administration Wave Certification & Architecture Freeze)** | **Complete** — programme **closed/frozen**; **PRODUCTION_READY_WITH_LIMITATIONS** retained; Reference Standard                                                                |
| **APZADMIN-005 (Administration Vertical Certification)**                   | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**; `audit:administration-vertical`                                                                                         |
| **APZADMIN-004 (Administration Workbench)**                                | **Complete** — `/workspace/administration`; ops at `/workspace/operations`; `audit:administration-workbench`                                                                  |
| **APZADMIN-003 (Administration HTTP API & Typed Client)**                  | **Complete** — `/api/v1/administration`; OpenAPI **1.6.0**; `apps/web/lib/administration`                                                                                     |
| **APZADMIN-002 (Platform Services, Gateway & Authorization)**              | **Complete** — `gateway.administration.*`; admin-contracts/core **0.2.0**; platform-services (now **0.23.0** with Identity)                                                   |
| **APZADMIN-001 (Platform Administration Foundation)**                      | **Complete** — `@apzhub/admin-persistence` **0.1.0**; migrations **0050/0051**                                                                                                |
| **APZCONFIG-005 (Configuration Vertical Certification)**                   | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**; `audit:configuration-vertical`                                                                                          |
| **APZNOTIFY-006 (Notification Wave Certification & Architecture Freeze)**  | **Complete** — programme **closed/frozen**; **PRODUCTION_READY_WITH_LIMITATIONS** retained                                                                                    |
| **APZTCMS-024 (Reporting Framework)**                                      | **Complete** — TCMS first consumer; templates remain product-owned                                                                                                            |
| **APZTCMS-023 (Executive Dashboards)**                                     | **Complete** — 12 dashboard categories                                                                                                                                        |
| **APZTCMS-009 (Certification Engine)**                                     | **Complete** — services **0.5.0**; contracts **0.6.0**; persistence **0.7.0**                                                                                                 |
| OSS-101-05 (Plane core services)                                           | Complete (`@apzhub/integration-plane` v0.2.0)                                                                                                                                 |
| OSS-101-06 (Plane task/issue capability)                                   | Complete (`@apzhub/integration-plane` v0.3.0)                                                                                                                                 |
| OSS-101-07 (Plane collaboration & intelligence)                            | Complete (`@apzhub/integration-plane` v0.4.0)                                                                                                                                 |
| OSS-101-08 (Plane sync, events & production readiness)                     | Complete (`@apzhub/integration-plane` v0.5.0)                                                                                                                                 |
| OSS-101-09 (Plane operations, diagnostics & certification)                 | Complete (`@apzhub/integration-plane` v0.6.0)                                                                                                                                 |
| OSS-110-08 (Platform TaskServiceImpl + gateway)                            | Complete (`@apzhub/platform-services` v0.6.0)                                                                                                                                 |
| OSS-110-09 (Task HTTP API surface)                                         | Complete (`/api/v1/tasks`)                                                                                                                                                    |
| OSS-110-07 (Platform HTTP API surface)                                     | Complete (`/api/v1`)                                                                                                                                                          |
| OSS-110-06 (Production authorisation & policy enforcement)                 | Complete (`@apzhub/platform-services` v0.5.0)                                                                                                                                 |
| OSS-110-05 (Persistent entity mapping store)                               | Complete (`@apzhub/platform-services` v0.4.0)                                                                                                                                 |
| OSS-110-04 (Platform execution layer)                                      | Complete (`@apzhub/platform-services` v0.3.0)                                                                                                                                 |
| OSS-110-03 (Mapping, orchestration, gateway)                               | Complete (`@apzhub/platform-services` v0.2.0)                                                                                                                                 |
| OSS-110-02 (Platform service implementations)                              | Complete (`@apzhub/platform-services` v0.1.0)                                                                                                                                 |
| OSS-110-01 (Platform service contracts)                                    | Complete (`@apzhub/platform-service-contracts` v0.1.0)                                                                                                                        |
| **OSS-110-14 (Support Module UI Certification)**                           | **Complete** — **PRODUCTION_READY_WITH_LIMITATIONS**                                                                                                                          |
| **OSS-110-13 (Support Module UI)**                                         | **Complete** — UI delivered                                                                                                                                                   |
| OSS-101-04 (Plane adapter foundation)                                      | Complete (`@apzhub/integration-plane` v0.1.0)                                                                                                                                 |
| OSS-101-03 (Projects manifests)                                            | Complete                                                                                                                                                                      |
| **APZHUB-000 (Knowledge Foundation)**                                      | **Complete**                                                                                                                                                                  |

---

## Current roadmap (owner-ratified sequencing)

```text
APZHUB-000 (Knowledge Foundation) → complete
    ↓
OSS-100-05 (AdapterBase) → complete
    ↓
OSS-101-04 (Plane adapter foundation) → complete
    ↓
OSS-101-05 (Plane core services) → complete
    ↓
OSS-110-01 (Platform service contracts) → complete
    ↓
OSS-110-02 (Platform service implementations) → complete
    ↓
OSS-110-03 (Mapping / orchestration / gateway) → complete
    ↓
OSS-110-04 (Platform execution layer) → complete
    ↓
OSS-110-05 (Persistent entity mapping store) → complete
    ↓
OSS-110-06 (Production authorisation & policy enforcement) → complete
    ↓
OSS-110-07 (Platform HTTP API surface `/api/v1`) → complete
    ↓
OSS-101-06 (Plane task/issue capability) → complete
    ↓
OSS-110-08 (Platform TaskServiceImpl + mapping + gateway) → complete
    ↓
OSS-110-09 (Task HTTP API `/api/v1/tasks`) → complete
    ↓
OSS-101-07 (Plane collaboration & intelligence) → complete
    ↓
OSS-101-08 (Plane sync, events & production readiness) → complete
    ↓
OSS-101-09 (Plane operations, diagnostics & certification) → complete
    ↓
OSS-101-10 (Wave 1 certification & closeout) → complete
    ↓
OSS-102-01 (Zammad discovery & architecture) → complete
    ↓
OSS-102-02 (Zammad integration foundation) → complete
    ↓
OSS-102-03 (Zammad core Support services) → complete
    ↓
OSS-102-04 (Zammad articles & attachment metadata) → complete
    ↓
OSS-102-05 (Zammad search, history & Support intelligence) → complete
    ↓
OSS-102-06 (Zammad sync, events & webhooks) → complete
    ↓
OSS-102-07 (Zammad operations, diagnostics & certification) → complete
    ↓
OSS-102-08 (Zammad Wave 2 certification & closeout) → complete — Wave 2 CLOSED
    ↓
OSS-110-10 (Support Platform Services, Providers & Mapping) → complete
    ↓
OSS-110-11 (Support HTTP API Surface) → complete
    ↓
OSS-110-12 (Support Vertical Slice Certification & Closeout) → complete — CERTIFIED_WITH_LIMITATIONS
    ↓
OSS-110-13 (Support Module UI) → complete — UI delivered
    ↓
OSS-110-14 (Support Module UI Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS
    ↓
OSS-100-06 (Shared HTTP Transport) → complete — @apzhub/integration-sdk v0.6.0
    ↓
OSS-100-07 (Mapping Provider Framework) → complete — @apzhub/integration-sdk v0.7.0
    ↓
OSS-100-08 (Webhook & polling contracts) → complete — @apzhub/integration-sdk v0.8.0
    ↓
OSS-100-09 (Harness & Certification) → complete — @apzhub/integration-sdk v0.9.0
    ↓
OSS-100-10 (SDK v1.0 Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; remained 0.9.0 until OSS-100-11
OSS-100-11 (SDK v1.0.0 Wave Freeze) → complete — @apzhub/integration-sdk 1.0.0 · Architecture Frozen · certify:integration-sdk
    ↓
APZTCMS-001 (APZ TCMS Vision & Architecture) → complete — docs only
    ↓
APZTCMS-002 (APZ TCMS Core Platform Foundation) → complete — testing-contracts / testing-foundation 0.1.0
    ↓
APZTCMS-003 (Domain Persistence & Permissions) → complete — testing-persistence 0.1.0; schema + RLS
    ↓
APZTCMS-004 (Manual Test Management / domain services) → complete — testing-services 0.1.0; contracts/persistence 0.2.0
    ↓
APZTCMS-005 (Production Persistence Completion) → complete — testing-persistence 0.3.0; full Postgres; migrations 0020/0021
    ↓
APZTCMS-006 (Manual Execution & Evidence Domain Engine) → complete — testing-services 0.2.0; contracts 0.3.0; persistence 0.4.0
    ↓
APZTCMS-007 (Automation Result Ingestion Domain) → complete — testing-services 0.3.0; contracts 0.4.0; persistence 0.5.0
    ↓
APZTCMS-008 (Quality Intelligence Domain) → complete — testing-services 0.4.0; contracts 0.5.0; persistence 0.6.0
    ↓
APZTCMS-009 (Certification Engine) → complete — testing-services 0.5.0; contracts 0.6.0; persistence 0.7.0
    ↓
APZTCMS-010 (Workbench UI) → complete — presentation-only UI; module enabled; mock client
    ↓
APZTCMS-011 (Testing Platform Services & Gateway) → complete — platform 0.8.0; gateway.testing.*
    ↓
APZTCMS-012 (HTTP API, OpenAPI & typed client) → complete — /api/v1/testing/**
    ↓
APZTCMS-013 (Vertical-Slice Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS
    ↓
APZTCMS-014 (Release & Quality Governance Domain) → complete — gateway.testing.releaseGovernance; contracts 0.8.0; persistence 0.8.0; services 0.7.0; platform 0.10.0
    ↓
APZTCMS-015 (External CI/CD Integration Framework) → complete — gateway.testing.pipelines; contracts 0.9.0; persistence 0.9.0; services 0.8.0; platform 0.11.0
    ↓
APZTCMS-016 (GitHub Actions Reference Adapter) → complete — @apzhub/integration-github-actions 0.1.0 (read-only)
    ↓
APZTCMS-017 (GitHub Actions Platform Service Integration) → complete — gateway.testing.pipeline*; contracts 0.12.0; platform-services 0.12.0; testing-services 0.9.0
    ↓
APZTCMS-018 (GitHub Actions User Experience) → complete — HTTP /api/v1/testing/pipelines + createHttpPipelineClient + workbench
    ↓
APZTCMS-019 (GitHub Actions Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS
    ↓
APZTCMS-020 (GitHub Actions Wave Closeout) → complete — CI/CD Reference Adapter Standard frozen; @apzhub/integration-github-actions is official CI/CD reference
APZTCMS-021 (Engineering Intelligence) → complete — domain services; gateway.testing.engineeringIntelligence
    ↓
APZTCMS-022 (EI HTTP API & Workbench) → complete — /api/v1/testing/engineering-intelligence + createHttpEngineeringIntelligenceClient + workbench
    ↓
APZDOCS-001 (Platform Document Foundation) → complete — document-contracts/core/persistence 0.1.0 base; schema 0037/0038; no UI/REST
APZDOCS-002 (Production Persistence & Storage Providers) → complete — contracts/core/persistence 0.2.0; document-storage 0.1.0; schema 0039/0040; filesystem+S3; coordinator+integrity; no REST/UI/OCR/AI/search/Event Bus/workers
APZDOCS-003 (Document Platform Services, Gateway & Authorization) → complete — contracts/core 0.3.0; platform-services 0.16.0; DocumentPlatformGateway + RequestPipeline authz; thin wrappers
APZDOCS-004 (Document HTTP API & Typed Client) → complete — `/api/v1/documents` + OpenAPI Platform Documents + createHttpDocumentClient; gateway-only handlers
APZDOCS-005 (Document Workbench) → complete — `/workspace/documents` + platform-documents manifests + read-only React Query UI over typed client; no uploads/downloads/OCR/AI/search
APZDOCS-006 (Document Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; architecture frozen at APZDOCS-005; vertical audit 0 violations
APZSEARCH-008 (Search Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; architecture frozen at APZSEARCH-007; vertical audit 0 violations
APZSEARCH-009 (Cross-Product Search Integration Framework) → complete — @apzhub/search-integration 0.2.0; canonical publication + product contracts; Search Platform frozen; no adapters/workers/Event Bus
APZSEARCH-010 (Projects Search Publication Adapter) → complete — @apzhub/search-projects 0.1.0; Workspace/Project/Task/Sprint/Milestone/Module/Team; no Meilisearch/Plane leakage
APZSEARCH-011 (Support Search Publication Adapter) → complete — @apzhub/search-support 0.1.0; Request/Article/Organisation/Group/User; no Meilisearch/Zammad leakage
APZSEARCH-012 (Documents Search Publication Adapter) → complete — @apzhub/search-documents 0.1.0; metadata-only Document/version/folder/collection/category/tag; no binary/OCR/storage keys
APZSEARCH-013 (APZ TCMS Search Publication Adapter) → complete — @apzhub/search-testing 0.1.1; metadata-only TCMS entities (manual/automation/certification/release/EI/quality/pipeline/report metadata); specialised publishers; no Meilisearch/binaries/Event Bus
APZSEARCH-015 (Search Publication Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; audit:search-publication PASS; harness testing/search-publication
APZSEARCH-014 (Reporting Search Publication Adapter) → complete — @apzhub/search-reporting 0.1.0; metadata-only report template/generation/output/catalogue entities; no rendering/parametersJson/checksum hex/Event Bus
APZSEARCH-016 (Product Indexing Orchestration Framework) → complete — @apzhub/search-orchestrator 0.1.0; PG journal 0058/0059; retry/batch/dedupe; composition hooks; audit:search-orchestrator; Search Platform unmodified
APZSEARCH-001 (Platform Search Foundation) → complete — @apzhub/search-contracts; models/providers/adapters/services/permissions; no HTTP/Workbench/engines/indexing/OCR/AI/Event Bus
APZSEARCH-002 (Search Persistence & Provider Framework) → complete — @apzhub/search-persistence 0.1.0; contracts 0.2.0; schema 0041/0042; registry + thin services; no HTTP/Workbench/engines/execution
APZREPORT-003 (Reporting Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; architecture frozen
APZREPORT-002 (Platform Reporting HTTP & Workbench) → complete — /api/v1/reporting + /workspace/reporting; typed client; OpenAPI valid
APZREPORT-001 (Platform Reporting Foundation) → complete — @apzhub/reporting-contracts + @apzhub/reporting-core; TCMS consumer unchanged
APZTCMS-024 (Reporting Framework) → complete — gateway.testing.reporting; template engine + 6 output providers; metadata only
APZTCMS-023 (Executive Dashboards) → complete — /workspace/testing/executive-dashboards (12 categories; EI client only)
APZWORKFLOW-001 (Platform Workflow Foundation) → complete — workflow-contracts/core/persistence; migrations 0044/0045; no HTTP/Workbench/execution/n8n
APZWORKFLOW-002 (Workflow Platform Services) → complete — gateway.workflow.*; SoR facets (package versions superseded under 007)
APZWORKFLOW-003 (Workflow HTTP API & Typed Client) → complete — /api/v1/workflows + OpenAPI Platform Workflow 1.2.0 + createHttpWorkflowClient
APZWORKFLOW-004 (Workflow Workbench) → complete — /workspace/workflows metadata UI; manifests; no designer/execution
APZWORKFLOW-005 (Workflow Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; audit:workflow-vertical PASS; harness testing/workflow-vertical; architecture frozen (management plane)
APZWORKFLOW-006 (n8n Reference Adapter Foundation) → complete — @apzhub/integration-n8n 0.1.0; read-only; audit:n8n-adapter PASS
APZWORKFLOW-007 (n8n Platform Services Integration) → complete — gateway.workflow.engine.*; platform-services 0.20.0; workflow-contracts 0.3.0; audit:workflow-n8n-platform-services PASS
APZWORKFLOW-008 (n8n HTTP API & Production Typed Client) → complete — /api/v1/workflows/engine/*; OpenAPI 1.3.0 Workflow Engine tag; createHttpWorkflowEngineClient(); audit:workflow-engine-http PASS
    ↓
APZWORKFLOW-009 (n8n Workbench Integration) → complete — /workspace/workflow-engine presentation over createHttpWorkflowEngineClient(); audit:workflow-engine-workbench PASS
    ↓
APZWORKFLOW-010 (Workflow Engine Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; audit:workflow-engine-vertical PASS
    ↓
APZWORKFLOW-011 (Workflow Engine Wave Certification & Reference Adapter Closeout) → complete — @apzhub/integration-n8n official Reference Adapter; architectures frozen; audit:workflow-engine-wave PASS
    ↓
APZNOTIFY-001 (Platform Notification Foundation) → complete — notification-contracts/core/persistence 0.1.0; migrations 0046/0047; audit:notification-foundation PASS; no delivery/HTTP/Gateway/Workbench
    ↓
APZNOTIFY-002 (Notification Platform Services, Gateway & Authorization) → complete — gateway.notification.*; platform-services 0.21.0; contracts/core 0.2.0; audit:notification-platform-services PASS; no HTTP/delivery
    ↓
APZNOTIFY-003 (Notification HTTP API & Production Typed Client) → complete — `/api/v1/notifications`; OpenAPI 1.4.0; apps/web/lib/notifications; audit:notification-http-client PASS; no delivery/Workbench
    ↓
APZNOTIFY-004 (Notification Workbench) → complete — `/workspace/notifications`; manifests; typed-client UI; audit:notification-workbench PASS; DELIVERY PROVIDERS NOT AVAILABLE; no delivery/realtime
    ↓
APZNOTIFY-005 (Notification Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; audit:notification-vertical PASS; harness testing/notification-vertical; metadata plane frozen
    ↓
APZNOTIFY-006 (Notification Wave Certification & Architecture Freeze) → complete — programme wave closed; audit:notification-wave PASS; architectures frozen; PRODUCTION_READY_WITH_LIMITATIONS retained
    ↓
APZCONFIG-001 (Platform Configuration Foundation) → complete — configuration-contracts/core/persistence; migrations 0048/0049; audit:configuration-foundation PASS; metadata SoR only
    ↓
APZCONFIG-002 (Configuration Platform Services, Gateway & Authorization) → complete — gateway.configuration.*; RequestPipeline; Production Authz; audit:configuration-platform-services PASS
    ↓
APZCONFIG-003 (Configuration HTTP API & Production Typed Client) → complete — `/api/v1/configuration`; OpenAPI 1.5.0+; apps/web/lib/configuration; audit:configuration-http-client PASS
    ↓
APZCONFIG-004 (Configuration Workbench) → complete — `/workspace/configuration`; manifests; typed-client UI; audit:configuration-workbench PASS; RUNTIME/FLAGS/SECRETS unavailable
    ↓
APZCONFIG-005 (Configuration Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; audit:configuration-vertical PASS; no runtime/secrets/flags
    ↓
APZCONFIG-006 (Configuration Wave Certification & Architecture Freeze) → complete — programme wave closed; audit:configuration-wave PASS; architectures frozen; Reference Standard declared; PRODUCTION_READY_WITH_LIMITATIONS retained
    ↓
APZADMIN-001 (Platform Administration Foundation) → complete — admin-persistence 0.1.0; migrations 0050/0051; audit:admin-foundation PASS
    ↓
APZADMIN-002 (Platform Services, Gateway & Authorization) → complete — gateway.administration.*; admin-contracts/core 0.2.0; platform-services 0.22.0; audit:administration-platform-services PASS; metadata SoR only (no HTTP/Workbench/runtime admin)
    ↓
APZADMIN-003 (Administration HTTP API & Production Typed Client) → complete — `/api/v1/administration`; OpenAPI 1.6.0; apps/web/lib/administration; audit:administration-http-client PASS; no runtime admin/user management
    ↓
APZADMIN-004 (Administration Workbench) → complete — `/workspace/administration`; platform-admin manifests; Platform Operations at `/workspace/operations`; audit:administration-workbench PASS; metadata governance UI only
    ↓
APZADMIN-005 (Administration Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; audit:administration-vertical PASS; no runtime admin/users/roles/tenants/provisioning/Event Bus/AI
    ↓
APZADMIN-006 (Administration Wave Certification & Architecture Freeze) → complete — programme wave closed; audit:administration-wave PASS; architectures frozen; Reference Standard declared; PRODUCTION_READY_WITH_LIMITATIONS retained
    ↓
APZIDENTITY-001 (Identity Administration Foundation) → complete — identity-persistence 0.1.0; migrations 0052/0053; audit:identity-foundation PASS; metadata SoR only (not authentication)
    ↓
APZIDENTITY-002 (Platform Services, Gateway & Authorization) → complete — gateway.identity.*; identity-contracts/core 0.2.0; platform-services 0.23.0; audit:identity-platform-services PASS; metadata SoR only
    ↓
APZIDENTITY-003 (Identity HTTP API & Production Typed Client) → complete — /api/v1/identity/*; apps/web/lib/identity; OpenAPI 1.7.0; audit:identity-http-client PASS; metadata SoR only (no Workbench/authentication/provisioning)
    ↓
APZIDENTITY-004 (Identity Administration Workbench) → complete — /workspace/identity; platform-identity manifests; audit:identity-workbench PASS; metadata management UI only (no authentication/provisioning/directory sync)
    ↓
APZIDENTITY-005 (Identity Vertical Certification) → complete — PRODUCTION_READY_WITH_LIMITATIONS; audit:identity-vertical PASS; certify:identity-vertical PASS; Journeys 1–10; no authentication/provisioning/directory sync
    ↓
APZIDENTITY-006 (Identity Wave Certification & Architecture Freeze) → complete — programme closed/frozen; audit:identity-wave PASS; Reference Standard published; PRODUCTION_READY_WITH_LIMITATIONS retained
    ↓
APZOBSERVE-001 (Platform Observability Foundation) → complete — observe-contracts/core/persistence 0.1.0; migrations 0054/0055; audit:observe-foundation PASS; metadata SoR only (not Grafana/Prometheus/Loki)
    ↓
APZOBSERVE-002 (Platform Services, Gateway & Authorization) → complete — gateway.observe.*; observe-contracts/core 0.2.0; platform-services 0.24.0; audit:observe-platform-services PASS; metadata only (no HTTP/providers)
    ↓
APZOBSERVE-003 (Observability HTTP API & Production Typed Client) → complete — /api/v1/observe/*; apps/web/lib/observe; OpenAPI 1.8.0; audit:observe-http-client PASS; metadata only (no providers)
    ↓
APZOBSERVE-004 (Observability Administration Workbench) → complete — /workspace/observability; platform-observability manifests; audit:observe-workbench PASS; metadata governance UI only (no providers/collection/ingest)
    ↓
APZOBSERVE-005 (Observability Vertical Certification & Production Readiness) → complete — PRODUCTION_READY_WITH_LIMITATIONS; certify:observe-vertical PASS; metadata plane only
    ↓
APZOBSERVE-006 (Observability Wave Certification & Architecture Freeze) → complete — programme closed/frozen; audit:observe-wave PASS; Reference Standard published; PRODUCTION_READY_WITH_LIMITATIONS retained
    ↓
APZMETRICS-001 (Platform Metrics Foundation) → complete — audit:metrics-foundation PASS; metrics packages foundation; migrations 0056/0057; metadata SoR only
    ↓
APZMETRICS-002 (Platform Services, Gateway & Authorization) → complete — audit:metrics-platform-services PASS; gateway.metrics.*; contracts/core 0.2.0; platform-services 0.26.1; APZHUB_METRICS_ENABLED bootstrap
    ↓
APZMETRICS-003 (Metrics HTTP API & Production Typed Client) → complete — audit:metrics-http-client PASS; /api/v1/metrics/*; apps/web/lib/metrics; OpenAPI 1.9.0; metadata transport only
    ↓
APZMETRICS-004 (Metrics Administration Workbench) → complete — audit:metrics-workbench PASS; /workspace/metrics; platform-metrics manifests order 55; metadata governance UI only
    ↓
APZMETRICS-005 (Metrics Vertical Certification) → complete — certify:metrics-vertical PASS; PRODUCTION_READY_WITH_LIMITATIONS; coverage 97.32%/99.04%
    ↓
APZMETRICS-006 (Metrics Wave Certification & Architecture Freeze) → complete — audit:metrics-wave PASS; Architecture Frozen; Reference Standard published; programme closed/frozen
    ↓
APZSEARCH-016 (Product Indexing Orchestration Framework) → complete — durable orchestration between product publication and frozen Search platform
APZSEARCH-017 (Search Publication Operations & Administration) → complete — @apzhub/search-publication-admin 0.1.0; HTTP + typed client + Workbench Publication Ops; orchestrator unmodified
    ↓
STOP — PCv2-02 COMPLETE (`@apzhub/platform-outbox` 0.1.0). APZHUB-KF-002 / KF-001 COMPLETE. Integration SDK 1.0.0 Architecture Frozen (OSS-100-11); Search Publication Architecture Frozen (APZSEARCH-019). Await explicit owner approval before any next programme. Primary AI entry: AI-MANIFEST.md.
```

---

## Current products

| Product          | App                                                                                                         | Status                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Platform         | `apps/web`                                                                                                  | Production-ready core                                                                                                          |
| Law Platform     | `apps/law-platform`                                                                                         | Validation advanced                                                                                                            |
| Trust Accounting | Law module                                                                                                  | Closed                                                                                                                         |
| Projects         | Planned UI; adapter **Wave 1 certified**                                                                    | Manifests + `@apzhub/integration-plane` v0.6.0                                                                                 |
| Support          | Vertical **CERTIFIED_WITH_LIMITATIONS** (OSS-110-12); UI **PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14) | HTTP + services + Zammad + workbench UI certified with limitations; no Event Bus / ingress / binary / notifications / realtime |
| **APZ TCMS**     | Native Testing & Certification product                                                                      | **APZREPORT-003 complete**; Document Platform **PRODUCTION_READY_WITH_LIMITATIONS** (**APZDOCS-006**)                          |

See [PRODUCT-CATALOGUE](./PRODUCT-CATALOGUE.md).

---

## Platform capabilities (delivered)

Runtime, Workbench, Identity, Authorization, Operations, Personalisation, Governance, Security, Bootstrap, Lifecycle, Command, Knowledge, Event/Notification, Activity/Timeline, Integration SDK (partial).

See [PLATFORM-CAPABILITY-CATALOGUE](./PLATFORM-CAPABILITY-CATALOGUE.md).

---

## Repository conventions

- **Monorepo:** pnpm workspaces
- **Apps:** `apps/web`, `apps/law-platform`
- **Packages:** `packages/{name}/`
- **Manifests:** `services/`, `modules/`, `integrations/`, `events/`
- **Docs:** `docs/` — foundation, architecture, adr, sprint, backlog, strategy
- **Tests:** Vitest (unit/integration), Playwright (E2E)
- **Quality gates:** `pnpm lint && pnpm typecheck && pnpm build && pnpm test && pnpm test:coverage`

See [REPOSITORY-GUIDE](./REPOSITORY-GUIDE.md).

---

## Documentation conventions

Every milestone produces:

- Completion report in `docs/sprint/`
- Backlog status update
- Architecture/spec updates if applicable
- CHANGELOG entry for significant releases
- Index updates

Every document includes: Purpose, Audience, Authoritative references, Status, Last updated.

---

## Things never to do

| Never                                      | Why                                   |
| ------------------------------------------ | ------------------------------------- |
| Start unapproved milestones                | Phase gates — owner approval required |
| Module → Connector direct calls            | Architectural defect (008, 009)       |
| Expose engine names in UI                  | Backend agnostic (001, 002)           |
| Put credentials in errors/logs/diagnostics | Security (013, OSS-100-02)            |
| Duplicate Platform Core in products        | Constitution principle                |
| Skip tests or quality gates                | Definition of Done (015)              |
| Invent new architecture                    | Capture current state faithfully      |
| Implement Plane adapter before OSS-100-05  | Explicit sequencing gate              |
| Frontend-only authorization                | Zero Trust (013)                      |
| Hardcode modules in shell                  | Module Registry (025)                 |
| Commit unless explicitly asked             | User preference                       |

---

## Current implementation status

See [CURRENT-STATE](./CURRENT-STATE.md) for versions, test counts, and package inventory.

---

## Reading order for AI sessions

```text
1. AI-MANIFEST (primary AI entry)
2. CURRENT-MILESTONE
3. AI-BOOTSTRAP (full procedure) / SESSION-START (short map)
4. AI-CONTEXT (this document)
5. APZHUB-CONSTITUTION
6. Sprint guide / backlog for approved work
7. Relevant foundation docs (001–029)
8. Relevant architecture docs and ADRs
9. AI-ENGINEERING-STANDARDS + AI-WORKFLOW
```

For historical narrative: [PROJECT-BIBLE](./PROJECT-BIBLE.md).  
For navigation: [PROJECT-INDEX](./PROJECT-INDEX.md).
