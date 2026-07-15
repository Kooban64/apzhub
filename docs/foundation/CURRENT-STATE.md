# APZHUB Current State

> **Purpose:** Implementation snapshot  
> **Last updated:** 2026-07-15  
> **Current status:** Active — **APZSEARCH-013 COMPLETE** (`@apzhub/search-testing` **0.1.0**); stop before **APZSEARCH-014** / GitLab CI (future) / AI Assist / SDK **1.0.0** / Event Bus / ingress / provisioning

---

## Repository

| Field | Value |
| --- | --- |
| **Root version** | `0.1.0-foundation` |
| **APZ TCMS** | **APZREPORT-003 complete** — Reporting **PRODUCTION_READY_WITH_LIMITATIONS** |
| **`@apzhub/search-contracts`** | `0.4.0` — Platform Search contracts + management + execution (APZSEARCH-006) |
| **`@apzhub/search-persistence`** | `0.2.0` — Search metadata persistence + management services (APZSEARCH-003) |
| **`@apzhub/integration-search-sdk`** | `0.1.0` — Search Integration SDK (APZSEARCH-004) |
| **`@apzhub/integration-meilisearch`** | `0.1.0` — Meilisearch Reference Adapter (APZSEARCH-005) |
| **`@apzhub/search-integration`** | `0.1.0` — Cross-Product Search Integration Framework (APZSEARCH-009) |
| **`@apzhub/search-projects`** | `0.1.0` — Projects Search Publication Adapter (APZSEARCH-010) |
| **`@apzhub/search-support`** | `0.1.0` — Support Search Publication Adapter (APZSEARCH-011) |
| **`@apzhub/search-documents`** | `0.1.0` — Documents Search Publication Adapter (APZSEARCH-012) |
| **`@apzhub/search-testing`** | `0.1.0` — APZ TCMS Search Publication Adapter (APZSEARCH-013) |
| **`@apzhub/document-contracts`** | `0.3.0` — DocumentPlatformGateway + permissions (APZDOCS-003) |
| **`@apzhub/document-core`** | `0.3.0` — Domain + assignFolder/assignCollection/applyRetention |
| **`@apzhub/document-persistence`** | `0.2.0` — PostgreSQL + in-memory; migrations 0037–0040 |
| **`@apzhub/document-storage`** | `0.1.0` — filesystem + S3-compatible + memory test providers |
| **`@apzhub/integration-github-actions`** | `0.1.0` — **CI/CD Reference Adapter** (read-only) |
| **`@apzhub/testing-contracts`** | `0.10.0` |
| **`@apzhub/testing-foundation`** | `0.1.0` |
| **`@apzhub/testing-persistence`** | `0.10.0` — migrations through `0034` |
| **`@apzhub/testing-services`** | `0.10.0` — engineering intelligence + pipelineAdapters |
| **`@apzhub/platform-service-contracts`** | `0.13.0` — `testing.engineeringIntelligence` facet |
| **`@apzhub/platform-services`** | `0.18.0` — Search management + execution gateway (APZSEARCH-006) |
| **`@apzhub/reporting-contracts`** | `0.1.0` — Platform Reporting contracts |
| **`@apzhub/reporting-core`** | `0.1.0` — Platform Reporting engine |
| **`@apzhub/integration-sdk`** | `0.9.0` — certified `PRODUCTION_READY_WITH_LIMITATIONS` (await owner for **1.0.0**) |
| **`@apzhub/integration-plane`** | `0.6.0` — certified Reference Adapter |
| **`@apzhub/integration-zammad`** | `0.6.0` — Wave 2 CERTIFIED_WITH_LIMITATIONS |
| **Platform HTTP API** | `/api/v1` — Projects + Tasks + Support + Testing + Reporting + Documents + **Search** (APZSEARCH-007/008) |
| **Support vertical** | **CERTIFIED_WITH_LIMITATIONS** (OSS-110-12) |
| **Support Module UI** | **PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14) — `apps/web/components/support`, `apps/web/lib/support`, manifests under `services/support/` |
| **Wave 1 (Plane / Projects)** | **COMPLETE** |
| **Wave 2 (Zammad / Support adapter)** | **CLOSED** |

---

## Completed milestones (recent)

| Milestone | Status |
| --- | --- |
| APZSEARCH-008 | Complete — Search Vertical Certification (**PRODUCTION_READY_WITH_LIMITATIONS**) |
| APZSEARCH-009 | Complete — Cross-Product Search Integration (`@apzhub/search-integration` **0.1.0**) |
| APZSEARCH-010 | Complete — Projects Search Publication Adapter (`@apzhub/search-projects` **0.1.0**) |
| APZSEARCH-011 | Complete — Support Search Publication Adapter (`@apzhub/search-support` **0.1.0**) |
| APZSEARCH-013 | Complete — APZ TCMS Search Publication Adapter (`@apzhub/search-testing` **0.1.0**) |
| APZSEARCH-012 | Complete — Documents Search Publication Adapter (`@apzhub/search-documents` **0.1.0**) |
| APZSEARCH-007 | Complete — Search HTTP API, Typed Client & Workbench |
| APZSEARCH-006 | Complete — Search Execution Gateway |
| APZSEARCH-005 | Complete — Meilisearch Reference Adapter |
| APZSEARCH-004 | Complete — Search Integration SDK |
| APZSEARCH-003 | Complete — Search Platform Services & Authorization |
| APZSEARCH-002 | Complete — Search Persistence & Provider Framework (`@apzhub/search-persistence` **0.1.0**) |
| APZSEARCH-001 | Complete — Platform Search Foundation (`@apzhub/search-contracts`) |
| APZDOCS-006 | Complete — Document Vertical Certification (**PRODUCTION_READY_WITH_LIMITATIONS**) |
| APZDOCS-005 | Complete — Document Workbench (`/workspace/documents` + manifests + typed client UI) |
| APZDOCS-004 | Complete — Document HTTP API & Typed Client (`/api/v1/documents` + OpenAPI + client) |
| APZDOCS-003 | Complete — Document Platform Services, Gateway & Authorization |
| APZDOCS-002 | Complete — Document Persistence & Storage Providers |
| APZDOCS-001 | Complete — Platform Document Foundation |
| APZTCMS-023 | Complete — Executive Dashboards (12 categories; presentation only) |
| APZTCMS-022 | Complete — Engineering Intelligence HTTP API & Workbench (presentation only) |
| APZTCMS-021 | Complete — Engineering Intelligence domain services |
| APZTCMS-020 | Complete — GitHub Actions Wave Closeout; CI/CD Reference Adapter Standard frozen |
| APZTCMS-019 | Complete — GitHub Actions Vertical Certification (**PRODUCTION_READY_WITH_LIMITATIONS**) |
| APZTCMS-018 | Complete — GitHub Actions User Experience (HTTP + `createHttpPipelineClient` + workbench Pipelines) |
| APZTCMS-017 | Complete — GitHub Actions Platform Service Integration (`gateway.testing.pipeline*`; providers) |
| APZTCMS-016 | Complete — GitHub Actions Reference Adapter (`@apzhub/integration-github-actions` **0.1.0**) |
| APZTCMS-015 | Complete — External CI/CD Integration Framework (`gateway.testing.pipelines`; migrations 0031/0032) |
| APZTCMS-014 | Complete — Release & Quality Governance Domain (`gateway.testing.releaseGovernance`; migrations 0029/0030) |
| APZTCMS-013 | Complete — Vertical-Slice Certification (**PRODUCTION_READY_WITH_LIMITATIONS**) |
| APZTCMS-011 | Complete — Testing Platform Services & Gateway (platform 0.8.0; `gateway.testing.*`) |
| APZTCMS-010 | Complete — Workbench UI (presentation only; module enabled; mock client) |
| APZTCMS-009 | Complete — Certification Engine (services 0.5.0; contracts 0.6.0; persistence 0.7.0) |
| APZTCMS-008 | Complete — Quality Intelligence Domain (services 0.4.0; contracts 0.5.0; persistence 0.6.0) |
| APZTCMS-007 | Complete — Automation Result Ingestion Domain (services 0.3.0; contracts 0.4.0; persistence 0.5.0) |
| APZTCMS-006 | Complete — Manual Execution & Evidence Domain Engine (services 0.2.0; contracts 0.3.0; persistence 0.4.0) |
| APZTCMS-005 | Complete — Production Persistence Completion (`testing-persistence` 0.3.0; migrations 0020/0021) |
| APZTCMS-004 | Complete — Manual Test Management (domain services 0.1.0; contracts/persistence 0.2.0) |
| APZTCMS-003 | Complete — Domain Persistence & Permissions |
| APZTCMS-002 | Complete — Core Platform Foundation (contracts, foundation, manifests) |
| APZTCMS-001 | Complete — APZ TCMS Product Vision, Architecture & Foundation (docs only) |
| OSS-100-10 | Complete — Integration SDK v1.0 Certification (`PRODUCTION_READY_WITH_LIMITATIONS`; package remains 0.9.0) |
| OSS-100-09 | Complete — Harness & Certification (`@apzhub/integration-sdk` v0.9.0) |
| OSS-100-08 | Complete — Webhook & polling contracts (`@apzhub/integration-sdk` v0.8.0) |
| OSS-100-07 | Complete — Mapping Provider Framework (`@apzhub/integration-sdk` v0.7.0) |
| OSS-100-06 | Complete — Shared HTTP Transport (`@apzhub/integration-sdk` v0.6.0) |
| OSS-110-14 | Complete — Support UI **PRODUCTION_READY_WITH_LIMITATIONS** |
| OSS-110-13 | Complete — Support Module UI delivered |
| OSS-110-12 | Complete — Support vertical CERTIFIED_WITH_LIMITATIONS |
| OSS-110-11 | Complete — Support HTTP API |
| OSS-110-10 | Complete — Support Platform Services |
| OSS-102-08 | Complete — Wave 2 closeout |
| OSS-101-10 | Complete — Wave 1 certification |
| OSS-100-05 | Complete — AdapterBase |

---

## Integration SDK (OSS-100)

| Phase | Status |
| --- | --- |
| OSS-100-01–05 | ✅ Complete |
| OSS-100-06 Shared HTTP Transport | ✅ Complete |
| OSS-100-07 Mapping Provider Framework | ✅ Complete — SDK mapping ≠ platform EntityMappingStore |
| OSS-100-08 Webhook & polling contracts | ✅ Complete — no ingress / Event Bus / workers |
| OSS-100-09 Harness & Certification | ✅ Complete — v0.9.0 |
| OSS-100-10 v1.0 Certification & Release Readiness | ✅ Complete — `PRODUCTION_READY_WITH_LIMITATIONS`; remain **0.9.0** |
| Provisioning (deferred 100-11+) / 1.0.0 bump / Event Bus / ingress | ⏸ Awaiting owner approval |

---

## Support vertical (certified + UI-certified)

| Layer | Status |
| --- | --- |
| HTTP `/api/v1/support-*` | ✅ certified |
| Gateway + RequestPipeline + authz | ✅ certified |
| Mapping (global IDs) | ✅ certified (platform store) |
| Zammad providers + adapter | ✅ certified (Wave 2 reused; SDK transport + mapping + events + harness wrappers) |
| Mock E2E HTTP→adapter | ✅ |
| Support Module UI (workbench) | ✅ **PRODUCTION_READY_WITH_LIMITATIONS** (OSS-110-14) |
| Event Bus / webhook ingress / binary / notifications / realtime | ❌ excluded limitations |

---

## Quality metrics (OSS-100-10)

| Gate | Result |
| --- | --- |
| SDK typecheck / lint | **PASS** |
| SDK package tests | **185** passed |
| sdk-v1 re-cert | **7** passed |
| Combined (SDK + sdk-v1) | **192** |
| Plane + Zammad | **223** passed |
| Wave1/2 + support-vertical + platform-service-contracts | **105** passed |
| Plane harness | **15** caps · Architecture fails **0** |
| Zammad harness | **11** caps · Architecture fails **0** |
| SDK maturity | **`PRODUCTION_READY_WITH_LIMITATIONS`** — package remains **0.9.0** until owner promotes **1.0.0** |

Prior OSS-100-09 harness coverage and OSS-110-14 Support UI metrics remain prior baselines.

---

## APZ TCMS

| Item | Status |
| --- | --- |
| Product identity | **APZ TCMS** — user-facing **Testing & Certification** (module `testing`) |
| APZTCMS-001 | ✅ Complete — docs/architecture (ADR-0059) |
| APZTCMS-002 | ✅ Complete — `@apzhub/testing-contracts` / `testing-foundation` **0.1.0**; service + disabled module manifests |
| APZTCMS-003 | ✅ Complete — `testing-schema` + migrations 0016/0017; `@apzhub/testing-persistence` **0.1.0**; platform authz namespaces/wildcards |
| APZTCMS-004 | ✅ Complete — contracts/persistence **0.2.0**; `@apzhub/testing-services` **0.1.0** (12 domain services); migrations 0018/0019 |
| APZTCMS-005 | ✅ Complete — `@apzhub/testing-persistence` **0.3.0**; full Postgres for all aggregates; migrations 0020/0021; no in-memory production fallback |
| APZTCMS-006 | ✅ Complete — services **0.2.0**; contracts **0.3.0**; persistence **0.4.0**; execution/evidence/approval domain engines; migration 0022 |
| APZTCMS-007 | ✅ Complete — services **0.3.0**; contracts **0.4.0**; persistence **0.5.0**; automation ingestion adapters + import pipeline; migrations 0023/0024 |
| APZTCMS-008 | ✅ Complete — services **0.4.0**; contracts **0.5.0**; persistence **0.6.0**; quality intelligence (defects, coverage, readiness, regression); migrations 0025/0026 |
| APZTCMS-009 | ✅ Complete — services **0.5.0**; contracts **0.6.0**; persistence **0.7.0**; certification engine (gates, workflow, human approve); migrations 0027/0028 |
| APZTCMS-010 | Complete — workbench UI (presentation only); manifests enabled; mock client; **117** Vitest tests |
| APZTCMS-011 | Complete — platform services **0.8.0**; `gateway.testing.*`; **33** targeted platform tests; domain regression **204** green |
| APZTCMS-012 | Complete — `/api/v1/testing/**`; `createHttpTestingClient`; focused Vitest **139** green; OpenAPI validated |
| APZTCMS-013 | ✅ Complete — **PRODUCTION_READY_WITH_LIMITATIONS**; architecture 0 violations; Vitest **478** + regression **417**; OpenAPI validated |
| APZTCMS-014 | ✅ Complete — Release & Quality Governance Domain; domain coverage **99.38%** lines; `gateway.testing.releaseGovernance` |
| APZTCMS-015 | ✅ Complete — External CI/CD Integration Framework; domain pipelines coverage **98.28%** lines; `gateway.testing.pipelines` |
| APZTCMS-016 | ✅ Complete — GitHub Actions Reference Adapter; **32** tests; coverage **95.62%** lines |
| APZTCMS-017 | ✅ Complete — GitHub Actions Platform Service Integration; live facets + providers; **100%** on new modules |
| APZTCMS-018 | ✅ Complete — GitHub Actions User Experience; OpenAPI valid; Vitest focused green; coverage **~96.6%** lines on new modules |
| APZTCMS-019 | ✅ Complete — GitHub Actions Vertical Certification — **PRODUCTION_READY_WITH_LIMITATIONS**; audits **0** violations; vertical Vitest **103** |
| APZTCMS-020 | ✅ Complete — Wave closeout; official CI/CD Reference Adapter; standard frozen; Vitest **103**; OpenAPI valid |
| APZTCMS-021 | ✅ Complete — Engineering Intelligence domain; contracts/persistence/services **0.10.0**; platform **0.13.0**; migrations 0033/0034; EI coverage **96.15%** lines |
| APZTCMS-022 | ✅ Complete — Engineering Intelligence HTTP API & Workbench; OpenAPI valid; Vitest focused green; coverage **~97.1%** lines on new modules |
| APZTCMS-023 | ✅ Complete — Executive Dashboards; Vitest focused green; coverage **~96.5%+** lines on new modules |
| APZTCMS-024 | ✅ Complete — Reporting Framework; contracts/persistence/services **0.11.0**; platform **0.14.0→0.15.0**; migrations 0035/0036; reporting coverage **~97.5%** lines |
| APZREPORT-001 | ✅ Complete — Platform Reporting Foundation; `@apzhub/reporting-contracts` **0.1.0**; `@apzhub/reporting-core` **0.1.0**; TCMS consumer unchanged |
| APZREPORT-002 | ✅ Complete — Platform Reporting HTTP API & Workbench; `/api/v1/reporting`; OpenAPI valid; typed client; `/workspace/reporting` |
| APZREPORT-003 | ✅ Complete — Reporting Vertical Certification — **PRODUCTION_READY_WITH_LIMITATIONS**; 0 audit violations; coverage ~**98.16%** |
| APZDOCS-001 | ✅ Complete — Platform Document Foundation; contracts/core/persistence **0.1.0→0.2.0** base |
| APZDOCS-002 | ✅ Complete — Production Persistence & Storage Providers; storage **0.1.0**; Vitest **40**; audit **0** violations |
| APZDOCS-003 | ✅ Complete — Document Platform Services, Gateway & Authorization; contracts/core **0.3.0**; platform-services **0.16.0**; Vitest **9**; audit **0** violations |
| Quality (010 UI) | Vitest **117** passed; coverage ~**98.89%** lines (scoped); Playwright E2E mock client |
| Product HTTP APIs / workbench HTTP client | ✅ Complete — APZTCMS-012 |
| Vertical-slice certification | ✅ Complete — APZTCMS-013 |
| Release & quality governance (TCMS) | ✅ Complete — APZTCMS-014 |
| CI/CD integration framework (TCMS) | ✅ Complete — APZTCMS-015 |
| GitHub Actions reference adapter | ✅ Complete — APZTCMS-016 |
| GitHub Actions platform service integration | ✅ Complete — APZTCMS-017 |
| GitHub Actions user experience | ✅ Complete — APZTCMS-018 |
| GitHub Actions vertical certification | ✅ Complete — APZTCMS-019 |
| GitHub Actions wave closeout | ✅ Complete — APZTCMS-020 |
| Engineering Intelligence (domain) | ✅ Complete — APZTCMS-021 |
| Engineering Intelligence HTTP & Workbench | ✅ Complete — APZTCMS-022 |
| Executive Dashboards | ✅ Complete — APZTCMS-023 |
| Reporting Framework (TCMS) | ✅ Complete — APZTCMS-024 |
| Platform Reporting Foundation | ✅ Complete — APZREPORT-001 |
| Platform Reporting HTTP & Workbench | ✅ Complete — APZREPORT-002 |
| Platform Reporting Vertical Certification | ✅ Complete — APZREPORT-003 — **PRODUCTION_READY_WITH_LIMITATIONS** |
| Platform Document Foundation | ✅ Complete — APZDOCS-001 |
| Document Persistence & Storage | ✅ Complete — APZDOCS-002 |
| Document Platform Services & Gateway | ✅ Complete — APZDOCS-003 |
| Document HTTP API & Typed Client | ✅ Complete — APZDOCS-004 |
| Document Workbench | ✅ Complete — APZDOCS-005 |
| Document Vertical Certification | ✅ Complete — APZDOCS-006 — **PRODUCTION_READY_WITH_LIMITATIONS** |
| Platform Search Foundation | ✅ Complete — APZSEARCH-001 |
| Search Persistence & Provider Framework | ✅ Complete — APZSEARCH-002 — `@apzhub/search-persistence` **0.2.0** |
| APZSEARCH-003 | ✅ Complete — Search Platform Services, Gateway & Authorization Integration |
| APZSEARCH-004 | ✅ Complete — Search Integration SDK — `@apzhub/integration-search-sdk` **0.1.0** |
| APZSEARCH-005 | ✅ Complete — Meilisearch Reference Adapter — `@apzhub/integration-meilisearch` **0.1.0** |
| APZSEARCH-006 | ✅ Complete — Meilisearch Platform Integration & Search Execution Gateway |
| APZSEARCH-007 | ✅ Complete — Search HTTP API, Typed Client & Workbench |
| APZSEARCH-008 | ✅ Complete — Search Vertical Certification (**PRODUCTION_READY_WITH_LIMITATIONS**) |
| APZSEARCH-009 | ✅ Complete — Cross-Product Search Integration Framework (`@apzhub/search-integration` **0.1.0**) |
| APZSEARCH-010 | ✅ Complete — Projects Search Publication Adapter (`@apzhub/search-projects` **0.1.0**) |
| APZSEARCH-011 | ✅ Complete — Support Search Publication Adapter (`@apzhub/search-support` **0.1.0**) |
| APZSEARCH-012 | ✅ Complete — Documents Search Publication Adapter (`@apzhub/search-documents` **0.1.0**) |
| APZSEARCH-013 | ✅ Complete — APZ TCMS Search Publication Adapter (`@apzhub/search-testing` **0.1.0**) |
| APZSEARCH-014 | ⏸ Recommended next — Reporting Search Publication Adapter (awaiting approval) |
| GitLab CI Reference Adapter | ⏸ Future — renumbered after owner redefined 021 |
| AI Assist | ⏸ Deferred; still needs owner approval |
| QE backlog / naming | Superseded by APZTCMS-* |
| Kiwi TCMS as SoR/UI | Superseded |

See [APZSEARCH-013 Completion Report](../sprint/APZSEARCH-013-completion-report.md) · [Testing Search Adapter Architecture](../architecture/APZHUB-Testing-Search-Publication-Adapter.md) · [APZSEARCH-012](../sprint/APZSEARCH-012-completion-report.md).

---

## Next

Await owner approval before **APZSEARCH-014** (Reporting Search Publication Adapter), **GitLab CI Reference Adapter**, **AI Assist**, **`@apzhub/integration-sdk` 1.0.0** promotion, **Platform Event Bus**, **webhook ingress**, **provisioning** (deferred 100-11+), or **next business-domain integration**. Stop — do not start any without approval.
