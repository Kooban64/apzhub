# APZ TCMS — Backlog

**Product:** APZ TCMS  
**Status:** Phased planning backlog — **planning IDs only**  
**Authority:** [Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md) · [Milestone Roadmap](./APZTCMS-Milestone-Roadmap.md)  
**Supersedes:** [QE Backlog](./APZHUB-Quality-Engineering-Backlog.md) for new delivery work

---

## Overview

| Phase | ID              | Theme                                         | Status                                      |
| ----- | --------------- | --------------------------------------------- | ------------------------------------------- |
| 1     | **APZTCMS-001** | Product Vision, Architecture & Foundation     | **COMPLETE** (docs only)                    |
| 2     | **APZTCMS-002** | Core Platform Foundation                      | **COMPLETE** (contracts/foundation 0.1.0)   |
| 3     | **APZTCMS-003** | Domain Persistence & Permissions              | **COMPLETE** (testing-persistence 0.1.0)    |
| 4     | **APZTCMS-004** | Manual Test Management                        | **COMPLETE** (testing-services 0.1.0; contracts/persistence 0.2.0) |
| 5     | **APZTCMS-005** | Production Persistence Completion             | **COMPLETE** (testing-persistence 0.3.0; migrations 0020/0021) |
| 6     | **APZTCMS-006** | Manual Execution & Evidence Domain Engine     | **COMPLETE** (services 0.2.0; contracts 0.3.0; persistence 0.4.0) |
| 7     | **APZTCMS-007** | Automation Result Ingestion Domain            | **COMPLETE** (services 0.3.0; contracts 0.4.0; persistence 0.5.0) |
| 8     | **APZTCMS-008** | Quality Intelligence Domain                   | **COMPLETE** (services 0.4.0; contracts 0.5.0; persistence 0.6.0) |
| 9     | **APZTCMS-009** | Certification Engine                          | **COMPLETE** (services 0.5.0; contracts 0.6.0; persistence 0.7.0) |
| 10    | **APZTCMS-010** | Workbench UI (core views)                     | **COMPLETE** (presentation-only UI; module enabled) |
| 11    | **APZTCMS-011** | Testing Platform Services & Gateway Integration | **COMPLETE** (platform **0.8.0**; `gateway.testing.*`) |
| 12    | **APZTCMS-012** | Testing HTTP API, OpenAPI & Production Typed Client | **COMPLETE** (`/api/v1/testing/**`; HTTP client; OpenAPI validated) |
| 13    | **APZTCMS-013** | Vertical-Slice Certification & Production Readiness | **COMPLETE** (**PRODUCTION_READY_WITH_LIMITATIONS**) |
| 14    | **APZTCMS-014** | Release & Quality Governance Domain | **COMPLETE** (contracts **0.8.0**; persistence **0.8.0**; services **0.7.0**; platform **0.10.0**) |
| 15    | **APZTCMS-015** | External CI/CD Integration Framework | **COMPLETE** (contracts **0.9.0**; persistence **0.9.0**; services **0.8.0**; platform **0.11.0**) |
| 16    | **APZTCMS-016** | GitHub Actions Reference Adapter | **COMPLETE** (`@apzhub/integration-github-actions` **0.1.0**) |
| 17    | **APZTCMS-017** | GitHub Actions Platform Service Integration | **COMPLETE** (contracts **0.12.0**; platform-services **0.12.0**; testing-services **0.9.0**) |
| 18    | **APZTCMS-018** | GitHub Actions User Experience | **COMPLETE** (HTTP + typed client + workbench) |
| 19    | **APZTCMS-019** | GitHub Actions Vertical Certification | **COMPLETE** — **PRODUCTION_READY_WITH_LIMITATIONS** |
| 20    | **APZTCMS-020** | GitHub Actions Wave Certification & Reference Adapter Closeout | **COMPLETE** — CI/CD Reference Adapter frozen |
| 21    | **APZTCMS-021** | Engineering Intelligence & Executive Quality Analytics | **COMPLETE** — domain services (owner redefined vs prior GitLab CI numbering) |
| 22    | **APZTCMS-022** | Engineering Intelligence HTTP API & Workbench | Recommended next — **await owner approval** |
| Later | **GitLab CI Reference Adapter** | Future CI/CD adapter (was formerly backlog 021) | Awaiting owner + milestone assignment |
| Later | **AI Assist** | Advisory AI suggestions only                   | Deferred; needs owner approval |

Each phase requires an approved sprint/milestone guide before implementation. **No coding under a phase until CURRENT-MILESTONE authorises it.**

---

## APZTCMS-001 — Product Vision, Architecture & Foundation

**Objective:** Establish APZ TCMS product identity, architecture, domain model, UI/integration strategy, ADR, backlog, and foundation catalogue updates.

**Scope:** Documentation pack listed in the completion report; QE predecessor banners; foundation updates.

**Out of scope:** All implementation (backend, frontend, DB, APIs, runners, integrations, notifications, realtime, mobile).

**Deliverables:** Vision, personas, architecture set, ADR-0059, backlog, roadmap, completion report, foundation updates.

**Stop condition:** **COMPLETE** — do not start APZTCMS-002 without owner approval.

---

## APZTCMS-002 — Core Platform Foundation

**Objective:** Scaffold platform contracts for Testing without full UI, runners, or persistence.

**Scope (delivered):**

- `module.yaml` for `testing` (disabled; nav declared)
- `service.yaml` for TestingService and CertificationService
- `@apzhub/testing-contracts` **0.1.0** — domain types, enums, service interfaces, events, permissions, config
- `@apzhub/testing-foundation` **0.1.0** — in-memory registries + validation helpers
- Permission catalogue stubs (contract-level)
- Architecture docs for foundation packages

**Out of scope (confirmed):** Database / ORM / migrations; full UI views; result adapters; workers; AI; notifications wiring; certification workflows end-to-end; service implementations.

**Scope clarification:** Owner brief forbade DB in 002. Older backlog wording that mentioned “schema design and migration start” under APZTCMS-002 is **superseded** — that work belongs to **APZTCMS-003**.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-003.

See [APZTCMS-002 Completion Report](../sprint/APZTCMS-002-completion-report.md).

---

## APZTCMS-003 — Domain Persistence & Permissions

**Objective:** Persist core entities; enforce authz on service mutations.

**Scope (delivered):**

- Platform PostgreSQL schema (`testing_*`) + migrations `0016_apz_tcms` / `0017_apz_tcms_rls`
- `@apzhub/testing-persistence` **0.1.0** — repositories (in-memory + Postgres), authz asserts, validation
- Live permission namespaces + seed wildcards via Platform Authorization
- Architecture guides: Persistence, Schema, Repository, Authorization, Migration

**Out of scope (confirmed):** Full manual runner UX; HTTP authoring APIs / workbench editors; automation ingestion; certification state machine completion; enabling full workbench UI; execution-result tables.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-004.

See [APZTCMS-003 Completion Report](../sprint/APZTCMS-003-completion-report.md).

---

## APZTCMS-004 — Manual Test Management

**Objective:** Manual testing **domain services** (business rules, lifecycle, validation, traceability) — not product UI.

**Scope (delivered):**

- `@apzhub/testing-contracts` **0.2.0** — expanded enums/domain/service interfaces
- `@apzhub/testing-persistence` **0.2.0** — migrations `0018`/`0019` (manual execution + case versions); in-memory repos; Postgres factory still falls back to in-memory for new aggregates (technical debt)
- `@apzhub/testing-services` **0.1.0** — twelve services via `createManualTestingServices` (includes domain `ManualExecutionService`; evidence **metadata** only)
- Architecture docs: Manual-Testing-Domain, Service-Architecture, Lifecycle, State-Machines, Validation-Rules, Traceability-Guide

**Out of scope (confirmed):** HTTP APIs; Workbench UI; evidence **binary** upload; Playwright product deps; automation ingestion; Event Bus.

**Scope clarification:** Owner brief for 004 was **domain services**. Older backlog wording that listed authoring **APIs/UI** under APZTCMS-004 is **superseded** — APIs/UI deferred to later milestones (see APZTCMS-006 delivery layer).

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-005.

See [APZTCMS-004 Completion Report](../sprint/APZTCMS-004-completion-report.md).

---

## APZTCMS-005 — Production Persistence Completion

**Objective:** Replace remaining in-memory repositories with production PostgreSQL for every Manual Testing aggregate. No delivery layer. No evidence binaries.

**Delivered:**

- `@apzhub/testing-persistence` **0.3.0** — full Postgres factory (no in-memory fallback)
- Migrations `0020` / `0021` — plan/suite version tables + approval history (+ RLS)
- Junction sync + manual step-actual dual write
- Architecture docs: Persistence Completion, Schema Update, updated Repository/Migration/Developer guides

**Out of scope (confirmed):** HTTP APIs; Workbench UI; evidence **binary** upload; automation ingestion; Event Bus.

**Scope clarification:** Owner brief redefined APZTCMS-005 as **persistence completion**. Older backlog wording that listed evidence binaries / API/UI under APZTCMS-005 is **superseded** — those themes move to **APZTCMS-006**.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-006.

See [APZTCMS-005 Completion Report](../sprint/APZTCMS-005-completion-report.md).

---

## APZTCMS-006 — Manual Execution & Evidence Domain Engine

**Objective:** Production business engine for manual execution, steps, evidence lifecycle, approvals, and history. No delivery layer.

**Delivered:**

- `@apzhub/testing-contracts` **0.3.0** — expanded statuses, evidence lifecycle, storage contracts
- `@apzhub/testing-persistence` **0.4.0** — migration `0022`
- `@apzhub/testing-services` **0.2.0** — execution/step/evidence/approval engines + in-memory storage provider
- Architecture docs: Manual Execution Engine, State Machine, Evidence Architecture/Lifecycle, Approval Engine, Execution History

**Out of scope (confirmed):** HTTP APIs; Workbench UI; S3/MinIO/Azure SDK; Event Bus; automation runners.

**Scope clarification:** Owner brief redefined APZTCMS-006 as **domain engine**. Older backlog “delivery” wording is **superseded**.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-007.

See [APZTCMS-006 Completion Report](../sprint/APZTCMS-006-completion-report.md).

---

## APZTCMS-007 — Automation Result Ingestion Domain

**Objective:** Vendor-neutral domain engine that imports automated test results into APZ TCMS (SoR). Does not execute frameworks.

**Delivered:**

- `@apzhub/testing-contracts` **0.4.0** — canonical model, adapters interface, ingestion service contracts, permissions
- `@apzhub/testing-persistence` **0.5.0** — migrations `0023`/`0024`
- `@apzhub/testing-services` **0.3.0** — `createAutomationIngestionServices` + Vitest/Playwright/JUnit/JSON/TAP/Allure-metadata adapters
- Architecture docs: Ingestion Architecture, Adapter Guide, Canonical Model, Normalization Rules, Coverage Ingestion Guide

**Out of scope (confirmed):** HTTP; UI; workers; CI/CD; Event Bus; runners; Allure server.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-008.

See [APZTCMS-007 Completion Report](../sprint/APZTCMS-007-completion-report.md).

---

## APZTCMS-008 — Quality Intelligence Domain

**Objective:** Defect relationships, coverage intelligence, quality snapshots, regression analysis, release/certification readiness inputs. No dashboards.

**Delivered:**

- `@apzhub/testing-contracts` **0.5.0** — defect/coverage/quality service contracts + permissions
- `@apzhub/testing-persistence` **0.6.0** — migrations `0025`/`0026`
- `@apzhub/testing-services` **0.4.0** — `createQualityIntelligenceServices`
- Architecture docs: Quality Intelligence Architecture, Coverage Model, Defect Model, Release Readiness Guide, Regression Analysis Guide

**Out of scope (confirmed):** HTTP; UI; dashboards; Jira/GitHub/ADO/GitLab sync; Event Bus; AI.

**Scope clarification:** Owner brief redefined APZTCMS-008 as **Quality Intelligence** (no dashboards). Older backlog “Dashboards” wording is **superseded**.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-009.

See [APZTCMS-008 Completion Report](../sprint/APZTCMS-008-completion-report.md).

---

## APZTCMS-009 — Certification Engine

**Objective:** Certification lifecycle, configurable quality gates, advisory recommendations, human multi-stage approvals, immutable audit. No auto-approve / AI.

**Delivered:**

- `@apzhub/testing-contracts` **0.6.0** — workflow statuses, gate outcomes, certification service contracts, permissions
- `@apzhub/testing-persistence` **0.7.0** — migrations `0027`/`0028`
- `@apzhub/testing-services` **0.5.0** — `createCertificationEngineServices`
- Architecture docs: Certification Engine Architecture, Workflow, Gate Evaluation, Recommendation, Approval, Audit models

**Out of scope (confirmed):** HTTP; UI; dashboards; AI recommendations; automatic approval; Event Bus; email; CI/CD.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-010.

See [APZTCMS-009 Completion Report](../sprint/APZTCMS-009-completion-report.md).

---

## APZTCMS-010 — Workbench UI (core views)

**Objective:** Permission-driven views per UI Architecture (Dashboard through Administration).

**Delivered:**

- Module **enabled** — parent `testing` + 15 child manifests under `services/testing/manifests/`
- `apps/web/lib/testing` — typed `TestingClient`, mock transport, routes, permissions, commands
- `apps/web/components/testing` — 15 sidebar views + dashboard; `TestingWorkspaceRouter`
- Shell wiring — `workbench-page.tsx` renders Testing workspace on `/workspace/testing` routes
- Architecture docs: Workbench Architecture, Navigation Guide, View Catalogue, Command Catalogue, UX Guide
- Quality: **117** Vitest tests; Playwright `apztcms-010-testing-workbench.spec.ts`; coverage ~**98.89%** lines (scoped)

**Out of scope (confirmed):** HTTP APIs; domain service wiring; DB; Event Bus; AI; binary upload; reporting engine.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-011.

See [APZTCMS-010 Completion Report](../sprint/APZTCMS-010-completion-report.md).

---

## APZTCMS-011 — Testing Platform Services & Gateway Integration

**Objective:** Expose APZ TCMS domain through platform service contracts, implementations, and nested `gateway.testing.*` with pipeline authz.

**Delivered:**

- `@apzhub/platform-service-contracts` **0.8.0** — seventeen testing service interfaces + `TestingPlatformGateway`
- `@apzhub/platform-services` **0.8.0** — `Testing*ServiceImpl`, error mapping, readiness, operation authz map
- Factories: `createTestingPlatformServices`, `ForProduction`, `ForTest`
- Env: `TESTING_SERVICE_ENABLED` — no silent in-memory/allow-all in production
- Architecture docs: Testing Platform Service pack (10 guides)
- Quality: **33** targeted platform Vitest tests; domain regression **204** green

**Out of scope (confirmed):** HTTP routes; OpenAPI; workbench HTTP client swap; Event Bus; AI; binary evidence; runners.

**Stop condition:** **COMPLETE** — APZTCMS-012 has since completed; stop now before APZTCMS-013.

See [APZTCMS-011 Completion Report](../sprint/APZTCMS-011-completion-report.md).

---

## APZTCMS-012 — Testing HTTP API, OpenAPI & Production Typed Client

**Objective:** `/api/v1/testing-*` route handlers, OpenAPI spec, production `HttpTestingClient` implementing workbench `TestingClient`.

**Delivered:**

- `/api/v1/testing/**` route handlers under `apps/web/app/api/v1/testing/` backed by `handlers/testing.ts`
- OpenAPI paths validated in `docs/specs/APZHUB-Platform-OpenAPI-v1.yaml`
- `createHttpTestingClient()` default outside `NODE_ENV=test`; mock client retained for tests
- Focused API, HTTP client, boundary, and Playwright mock-route tests
- Architecture docs and [APZTCMS-012 Completion Report](../sprint/APZTCMS-012-completion-report.md)

**Out of scope (confirmed):** AI, binary evidence upload, live runners, Event Bus, notifications, automatic certification decisions.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-013.

---

## APZTCMS-013 — Vertical-Slice Certification & Production Readiness

**Objective:** Certify the Testing vertical slice end to end and classify production readiness — no new business functionality.

**Delivered:** Architecture / dependency / boundary audits (0 violations); API / security / accessibility / performance / quality reports; TCMS Vitest **478** + regression **417**; OpenAPI validated; classification **PRODUCTION_READY_WITH_LIMITATIONS**.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-014.

See [APZTCMS-013 Completion Report](../sprint/APZTCMS-013-completion-report.md) · [Vertical-Slice Certification](../architecture/APZHUB-APZ-TCMS-Vertical-Slice-Certification.md).

---

## AI Assist (advisory) (deferred)

**Objective:** AISuggestion types and governed suggestion flows — suggest only.

**Status:** Deferred after APZTCMS-013; requires new owner approval.

---

## APZTCMS-014 — Release & Quality Governance Domain

**Objective:** Formal TCMS-only Release & Quality Governance — state machine, human approvals, advisory readiness/risk aggregation, Postgres persistence, `gateway.testing.releaseGovernance`. No Product Registry, cross-product governance, CI/CD, HTTP, or UI.

**Delivered:** contracts **0.8.0**; persistence **0.8.0** (migrations 0029/0030); services **0.7.0**; platform **0.10.0**; architecture docs under `APZHUB-APZ-TCMS-Release-*`; domain coverage **99.38%** lines.

**Supersedes:** Earlier Platform Quality Integration Layer / Product Registry interpretation of APZTCMS-014.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-015.

See [APZTCMS-014 Completion Report](../sprint/APZTCMS-014-completion-report.md).

---

## AI Assist (advisory) (deferred)

**Objective:** AISuggestion types and governed suggestion flows — suggest only.

**Status:** Deferred; requires new owner approval.

---

## APZTCMS-015 — External CI/CD Integration Framework

**Objective:** Vendor-neutral CI/CD metadata integration — external systems as information providers; APZ TCMS SoR.

**Stop condition:** **COMPLETE** — APZTCMS-016 subsequently completed; programme stop is APZTCMS-017.

See [APZTCMS-015 Completion Report](../sprint/APZTCMS-015-completion-report.md).

---

## APZTCMS-016 — GitHub Actions Reference Adapter

**Objective:** First production read-only GitHub Actions reference adapter on APZTCMS-015 contracts.

**Stop condition:** **COMPLETE** — APZTCMS-017 subsequently completed; programme stop is APZTCMS-018.

See [APZTCMS-016 Completion Report](../sprint/APZTCMS-016-completion-report.md).

---

## APZTCMS-017 — GitHub Actions Platform Service Integration

**Objective:** Wire GitHub Actions adapter into Platform Services / TCMS pipeline gateway facets.

**Stop condition:** **COMPLETE** — APZTCMS-018 subsequently completed; programme stop is APZTCMS-019.

See [APZTCMS-017 Completion Report](../sprint/APZTCMS-017-completion-report.md).

---

## APZTCMS-018 — GitHub Actions User Experience

**Objective:** HTTP API, typed client, and Testing workbench UX for existing GitHub Actions / pipeline platform capability (presentation only).

**Stop condition:** **COMPLETE** — APZTCMS-019 subsequently completed; programme stop is APZTCMS-020.

See [APZTCMS-018 Completion Report](../sprint/APZTCMS-018-completion-report.md).

---

## APZTCMS-019 — GitHub Actions Vertical Certification

**Objective:** Certify the complete GitHub Actions vertical as production-ready (no new functionality).

**Stop condition:** **COMPLETE** — APZTCMS-020 subsequently completed; programme stop is APZTCMS-021.

See [APZTCMS-019 Completion Report](../sprint/APZTCMS-019-completion-report.md).

---

## APZTCMS-020 — GitHub Actions Wave Certification & Reference Adapter Closeout

**Objective:** Certify GitHub Actions as the official CI/CD Reference Adapter; freeze standards for future providers.

**Stop condition:** **COMPLETE** — APZTCMS-021 subsequently completed; programme stop is APZTCMS-022.

See [APZTCMS-020 Completion Report](../sprint/APZTCMS-020-completion-report.md).

---

## APZTCMS-021 — Engineering Intelligence & Executive Quality Analytics

**Objective:** Deterministic engineering quality intelligence domain aggregating existing TCMS SoR (no REST/UI/AI/adapters).

**Owner note:** Owner brief redefined APZTCMS-021 from “GitLab CI Reference Adapter” to Engineering Intelligence. GitLab CI remains a future milestone.

**Stop condition:** **COMPLETE** — await owner approval before APZTCMS-022.

See [APZTCMS-021 Completion Report](../sprint/APZTCMS-021-completion-report.md).

---

## APZTCMS-022 — Engineering Intelligence HTTP API & Workbench

**Objective:** Expose Engineering Intelligence via HTTP API, OpenAPI, typed client, and Workbench presentation.

**Stop condition:** Not started — await owner approval.

---

## APZTCMS-014 (superseded naming) — Platform Quality Integration Layer / Cross-product

**Superseded:** Owner redefined APZTCMS-014 as **Release & Quality Governance Domain** (TCMS-only). Product Registry / cross-product platform quality are out of scope for this milestone ID.

## APZTCMS-011 (superseded naming) — AI Assist

**Superseded:** Owner redefined APZTCMS-011 as **Testing Platform Services & Gateway Integration**. AI Assist deferred until after APZTCMS-013 or later.

---

## APZTCMS-012 (superseded naming) — Cross-product Integrations

**Superseded:** Former APZTCMS-012 cross-product scope renumbered to **APZTCMS-014** after HTTP API milestone insertion.

---

## Mapping from superseded QE backlog

| Former QE ID        | Approximate APZTCMS successor theme  |
| ------------------- | ------------------------------------ |
| QE-001              | APZTCMS-002 / 003                    |
| QE-002–004          | APZTCMS-004 / 005                    |
| QE-005–006, 012–014 | APZTCMS-006 (+ specialised adapters) |
| QE-007–009          | APZTCMS-007 / 008                    |
| QE-010–011          | APZTCMS-010                          |
| QE-015              | APZTCMS-012                          |

Do not implement QE-* IDs for new work.

---

## Related

- [Milestone Roadmap](./APZTCMS-Milestone-Roadmap.md)
- [APZTCMS-001 Completion Report](../sprint/APZTCMS-001-completion-report.md)
- [APZTCMS-002 Completion Report](../sprint/APZTCMS-002-completion-report.md)
- [APZTCMS-003 Completion Report](../sprint/APZTCMS-003-completion-report.md)
- [APZTCMS-004 Completion Report](../sprint/APZTCMS-004-completion-report.md)
- [APZTCMS-005 Completion Report](../sprint/APZTCMS-005-completion-report.md)
- [APZTCMS-006 Completion Report](../sprint/APZTCMS-006-completion-report.md)
- [APZTCMS-007 Completion Report](../sprint/APZTCMS-007-completion-report.md)
- [APZTCMS-008 Completion Report](../sprint/APZTCMS-008-completion-report.md)
- [APZTCMS-009 Completion Report](../sprint/APZTCMS-009-completion-report.md)
- [APZTCMS-010 Completion Report](../sprint/APZTCMS-010-completion-report.md)
- [APZTCMS-011 Completion Report](../sprint/APZTCMS-011-completion-report.md)
- [APZTCMS-012 Completion Report](../sprint/APZTCMS-012-completion-report.md)
