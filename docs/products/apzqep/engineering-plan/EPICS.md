# APZQEP-PLAN-001 — Engineering Epics

> **Programme:** APZQEP-PLAN-001  
> **Classification:** ENGINEERING PLANNING  
> **Baseline:** APZQEP-ARCH-001 (**ACCEPTED**) · APZQEP-DEF-002 (**ACCEPTED**)  
> **Rule:** Epic definitions only — no implementation

## Purpose

This document breaks **every release** (0.1–1.0) into engineering epics. Each epic includes purpose, dependencies, deliverables, acceptance criteria, estimated complexity, parallelisation opportunities, and risk.

Epic IDs follow the pattern **`QEP-E-{release}-{seq}`** (e.g. `QEP-E-0.4-02`).

Complexity scale: **S** (small, ≤1 sprint) · **M** (medium, 1–2 sprints) · **L** (large, 2–3 sprints) · **XL** (extra large, 3+ sprints or cross-team).

---

## Epic index by release

| Release   | Epic count | Primary modules               |
| --------- | ---------- | ----------------------------- |
| 0.1       | 5          | Infrastructure                |
| 0.2       | 6          | M01, M20, M21, M22            |
| 0.3       | 5          | M02, M19, M01                 |
| 0.4       | 5          | M03, M10 stub, M22            |
| 0.5       | 6          | M04, M05, M10                 |
| 0.6       | 5          | M06, M07 stub                 |
| 0.7       | 5          | M09, M10                      |
| 0.8       | 5          | M08, M11, M19                 |
| 0.9       | 7          | M12, M13, M14, M15, M01       |
| 1.0       | 6          | M01–M22 hardening + scaffolds |
| **Total** | **55**     | All M01–M22 scheduled         |

---

## Release 0.1 — Bootstrap epics

### QEP-E-0.1-01 — Monorepo QEP package skeleton

| Field                   | Value                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| **Purpose**             | Create QEP package tree within APZHUB pnpm workspace without domain logic                           |
| **Dependencies**        | APZQEP-PLAN-001 Acceptance; APZQEP-ENG-010 authorisation                                            |
| **Deliverables**        | `modules/qep/`, `services/qep/`, `packages/qep-*` skeleton; workspace `pnpm-workspace.yaml` entries |
| **Acceptance criteria** | Packages resolve; `pnpm build` succeeds; no duplicate platform packages                             |
| **Complexity**          | M                                                                                                   |
| **Parallelisation**     | Independent of CI epic after day 1 structure freeze                                                 |
| **Risk**                | Workspace naming collision with platform packages — **mitigate:** prefix `qep-`                     |

### QEP-E-0.1-02 — CI/CD pipeline and quality gates

| Field                   | Value                                                                           |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Purpose**             | QEP-specific CI: lint, Prettier, TypeScript strict, Vitest harness              |
| **Dependencies**        | QEP-E-0.1-01                                                                    |
| **Deliverables**        | GitHub workflow; cache strategy; required checks on PR                          |
| **Acceptance criteria** | CI green on empty suites; fails on lint/type errors; matches platform 015 gates |
| **Complexity**          | M                                                                               |
| **Parallelisation**     | Parallel with E-0.1-03 after skeleton exists                                    |
| **Risk**                | CI duration bloat — **mitigate:** affected-package filtering                    |

### QEP-E-0.1-03 — Manifest validation and SDK registry

| Field                   | Value                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| **Purpose**             | Manifest-first compliance for all M01–M22 and AS-01–AS-22 stubs    |
| **Dependencies**        | QEP-E-0.1-01                                                       |
| **Deliverables**        | `module.yaml` ×22; `service.yaml` ×22; CI manifest validator       |
| **Acceptance criteria** | Registry discovery PASS; invalid manifests fail CI                 |
| **Complexity**          | L                                                                  |
| **Parallelisation**     | Module manifests ∥ service manifests                               |
| **Risk**                | SDK schema drift from Platform 1.4 — **mitigate:** pin SDK version |

### QEP-E-0.1-04 — Local development and containerisation

| Field                   | Value                                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| **Purpose**             | Developer onboarding: local stack, env template, Docker alignment            |
| **Dependencies**        | QEP-E-0.1-01                                                                 |
| **Deliverables**        | LOCAL-DEV guide; `.env.example`; compose profile for QEP                     |
| **Acceptance criteria** | New developer runs stack per guide; coexistence with ENVIRONMENT.md verified |
| **Complexity**          | S                                                                            |
| **Parallelisation**     | Fully parallel with E-0.1-02, E-0.1-03                                       |
| **Risk**                | Port conflict with legacy apz-stack — **mitigate:** documented port map      |

### QEP-E-0.1-05 — Engineering documentation scaffold

| Field                   | Value                                                           |
| ----------------------- | --------------------------------------------------------------- |
| **Purpose**             | ADR folder, runbook placeholders, engineering README            |
| **Dependencies**        | None                                                            |
| **Deliverables**        | `docs/products/apzqep/engineering/` structure; ADR template     |
| **Acceptance criteria** | Linked from product README; ADR numbering convention documented |
| **Complexity**          | S                                                               |
| **Parallelisation**     | Fully independent                                               |
| **Risk**                | Low                                                             |

---

## Release 0.2 — Identity and platform integration epics

### QEP-E-0.2-01 — Platform identity and session integration

| Field                   | Value                                                                     |
| ----------------------- | ------------------------------------------------------------------------- |
| **Purpose**             | QEP routes authenticate via BetterAuth; session context on all requests   |
| **Dependencies**        | Release 0.1 complete                                                      |
| **Deliverables**        | Gateway auth middleware; session context propagation; correlation IDs     |
| **Acceptance criteria** | Unauthenticated requests rejected; tenant ID in context; E2E login PASS   |
| **Complexity**          | M                                                                         |
| **Parallelisation**     | Must complete before permission epic                                      |
| **Risk**                | Session handoff edge cases — **mitigate:** platform auth test suite reuse |

### QEP-E-0.2-02 — QEP permission catalogue and role templates

| Field                   | Value                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| **Purpose**             | Define QEP permissions, roles, cert authority tiers on PermissionService |
| **Dependencies**        | QEP-E-0.2-01                                                             |
| **Deliverables**        | Permission manifest; role templates; authz integration tests             |
| **Acceptance criteria** | Server-side authz denies unauthorised mutations; cert roles distinct     |
| **Complexity**          | L                                                                        |
| **Parallelisation**     | Policy design ∥ identity integration after E-0.2-01                      |
| **Risk**                | Role explosion — **mitigate:** align to DEF-002 personas                 |

### QEP-E-0.2-03 — QEP Administration service and module (M20)

| Field                   | Value                                                                 |
| ----------------------- | --------------------------------------------------------------------- |
| **Purpose**             | QEPAdministrationService (AS-19) and administration UI for QEP policy |
| **Dependencies**        | QEP-E-0.2-02                                                          |
| **Deliverables**        | Service manifest; policy CRUD; M20 module shell                       |
| **Acceptance criteria** | Admin configures retention template; changes audited                  |
| **Complexity**          | L                                                                     |
| **Parallelisation**     | Backend service ∥ frontend module after interfaces defined            |
| **Risk**                | Overlap with platform admin — **mitigate:** QEP policy scope only     |

### QEP-E-0.2-04 — QEP Audit facade (M21)

| Field                   | Value                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| **Purpose**             | QEPAuditService (AS-20) investigation views over platform audit      |
| **Dependencies**        | QEP-E-0.2-01                                                         |
| **Deliverables**        | Audit search UI; export; correlation drill-down                      |
| **Acceptance criteria** | Privileged audit view permission-gated; export works                 |
| **Complexity**          | M                                                                    |
| **Parallelisation**     | Parallel with E-0.2-03 after auth                                    |
| **Risk**                | Performance on large audit volumes — **mitigate:** paginated queries |

### QEP-E-0.2-05 — Search facade and provider registry (M22)

| Field                   | Value                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| **Purpose**             | QEPSearchFacadeService (AS-21); global search shell integration      |
| **Dependencies**        | QEP-E-0.2-01                                                         |
| **Deliverables**        | Provider registry; search UI hook; empty provider tests              |
| **Acceptance criteria** | Provider registration API works; search returns platform nav results |
| **Complexity**          | M                                                                    |
| **Parallelisation**     | Parallel with E-0.2-04                                               |
| **Risk**                | Low — platform SearchService mature                                  |

### QEP-E-0.2-06 — Home module stub and shell registration (M01)

| Field                   | Value                                                                     |
| ----------------------- | ------------------------------------------------------------------------- |
| **Purpose**             | Register QEP in shell; HomeCompositionService stub; placeholder dashboard |
| **Dependencies**        | QEP-E-0.2-02                                                              |
| **Deliverables**        | Activity bar entry; M01 module; AS-22 stub; permission-filtered nav       |
| **Acceptance criteria** | User sees QEP workspace; nav items match permissions                      |
| **Complexity**          | M                                                                         |
| **Parallelisation**     | UI parallel after nav manifest                                            |
| **Risk**                | Shell API changes — **mitigate:** Platform 1.4 pin                        |

---

## Release 0.3 — Portfolio epics

### QEP-E-0.3-01 — PortfolioService domain (AS-01)

| Field                   | Value                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| **Purpose**             | Project, environment, team, owner aggregates and lifecycle       |
| **Dependencies**        | Release 0.2 complete                                             |
| **Deliverables**        | AS-01 service; domain tests; events on state change              |
| **Acceptance criteria** | Draft→Active→Archived enforced; owner required for Active        |
| **Complexity**          | L                                                                |
| **Parallelisation**     | Domain ∥ UI after contracts                                      |
| **Risk**                | Scope creep into ALM — **mitigate:** DEF-002 exclusions enforced |

### QEP-E-0.3-02 — Portfolio and Projects module (M02)

| Field                   | Value                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| **Purpose**             | M02 presentation: project CRUD, dashboards, quality profile stub |
| **Dependencies**        | QEP-E-0.3-01                                                     |
| **Deliverables**        | M02 module; project list/detail; basic dashboard                 |
| **Acceptance criteria** | Playwright create-project slice PASS                             |
| **Complexity**          | L                                                                |
| **Parallelisation**     | Frontend after service API contract (not OpenAPI in plan)        |
| **Risk**                | Medium                                                           |

### QEP-E-0.3-03 — Integration Management foundation (M19 / AS-18)

| Field                   | Value                                                      |
| ----------------------- | ---------------------------------------------------------- |
| **Purpose**             | Connector catalogue, health states, configuration UI       |
| **Dependencies**        | QEP-E-0.3-01                                               |
| **Deliverables**        | AS-18 service stub; M19 UI; health polling pattern         |
| **Acceptance criteria** | Connector list renders; health states update               |
| **Complexity**          | M                                                          |
| **Parallelisation**     | Parallel with E-0.3-02                                     |
| **Risk**                | Connector credentials — **mitigate:** platform secret refs |

### QEP-E-0.3-04 — Project-scoped permissions

| Field                   | Value                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| **Purpose**             | Enforce project isolation in authz layer                            |
| **Dependencies**        | QEP-E-0.3-01; QEP-E-0.2-02                                          |
| **Deliverables**        | Project scope rules; integration tests                              |
| **Acceptance criteria** | Cross-project access denied; audit on violation attempt             |
| **Complexity**          | M                                                                   |
| **Parallelisation**     | Parallel with module UI                                             |
| **Risk**                | High — tenant leakage — **mitigate:** dedicated security test suite |

### QEP-E-0.3-05 — Home project widgets (M01)

| Field                   | Value                                             |
| ----------------------- | ------------------------------------------------- |
| **Purpose**             | AS-22 project summary widgets on home             |
| **Dependencies**        | QEP-E-0.3-01                                      |
| **Deliverables**        | Widget components; composition queries            |
| **Acceptance criteria** | Home shows assigned projects; permission-filtered |
| **Complexity**          | S                                                 |
| **Parallelisation**     | After E-0.3-02 interfaces                         |
| **Risk**                | Low                                               |

---

## Release 0.4 — Requirements epics

### QEP-E-0.4-01 — RequirementService core (AS-02)

| Field                   | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| **Purpose**             | Requirement CRUD, hierarchy, types, acceptance criteria |
| **Dependencies**        | Release 0.3 complete                                    |
| **Deliverables**        | AS-02 domain; validation rules; unit tests              |
| **Acceptance criteria** | Acceptance criteria required before submit-for-review   |
| **Complexity**          | L                                                       |
| **Parallelisation**     | Domain first; UI parallel                               |
| **Risk**                | Complex hierarchy — **mitigate:** incremental depth MVP |

### QEP-E-0.4-02 — Requirement approval workflow

| Field                   | Value                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| **Purpose**             | Draft→In review→Approved state machine; author/approver separation |
| **Dependencies**        | QEP-E-0.4-01; QEP-E-0.2-02                                         |
| **Deliverables**        | Workflow orchestration; audit events; notifications via EventBus   |
| **Acceptance criteria** | Approver cannot be sole author; rejection returns to Draft         |
| **Complexity**          | L                                                                  |
| **Parallelisation**     | Sequential on E-0.4-01                                             |
| **Risk**                | Workflow edge cases — **mitigate:** state machine tests            |

### QEP-E-0.4-03 — Baselines and import

| Field                   | Value                                                                          |
| ----------------------- | ------------------------------------------------------------------------------ |
| **Purpose**             | Baseline creation; CSV/JSON import coordination                                |
| **Dependencies**        | QEP-E-0.4-02                                                                   |
| **Deliverables**        | Baseline API; import job async pattern                                         |
| **Acceptance criteria** | Baseline immutable snapshot; import validates and reports errors               |
| **Complexity**          | M                                                                              |
| **Parallelisation**     | Import ∥ baseline after approval exists                                        |
| **Risk**                | Import format disputes — **mitigate:** documented import spec in ENG programme |

### QEP-E-0.4-04 — Requirements module (M03)

| Field                   | Value                                                    |
| ----------------------- | -------------------------------------------------------- |
| **Purpose**             | M03 UI: repository, editor, review queue, baseline views |
| **Dependencies**        | QEP-E-0.4-01, E-0.4-02                                   |
| **Deliverables**        | M03 module; Playwright approve-requirement scenario      |
| **Acceptance criteria** | E2E approve path PASS; a11y axe clean                    |
| **Complexity**          | L                                                        |
| **Parallelisation**     | UI parallel with E-0.4-03                                |
| **Risk**                | Medium                                                   |

### QEP-E-0.4-05 — Traceability stub and search provider

| Field                   | Value                                                       |
| ----------------------- | ----------------------------------------------------------- |
| **Purpose**             | AS-09 requirement records; M22 requirements search provider |
| **Dependencies**        | QEP-E-0.4-01                                                |
| **Deliverables**        | Traceability stub; search indexing on approval event        |
| **Acceptance criteria** | Approved requirements searchable; trace ID assigned         |
| **Complexity**          | S                                                           |
| **Parallelisation**     | Parallel with M03                                           |
| **Risk**                | Low                                                         |

---

## Release 0.5 — Verification epics

### QEP-E-0.5-01 — VerificationLibraryService (AS-03)

| Field                   | Value                                                                             |
| ----------------------- | --------------------------------------------------------------------------------- |
| **Purpose**             | Library CRUD, versions, suites, templates, manual procedures                      |
| **Dependencies**        | Release 0.4 complete                                                              |
| **Deliverables**        | AS-03 service; retirement workflow                                                |
| **Acceptance criteria** | Version publish audited; shared templates require approval                        |
| **Complexity**          | L                                                                                 |
| **Parallelisation**     | Independent of design service after shared contracts                              |
| **Risk**                | Versioning complexity — **mitigate:** explicit version model ADR in ENG programme |

### QEP-E-0.5-02 — VerificationDesignService (AS-04)

| Field                   | Value                                                               |
| ----------------------- | ------------------------------------------------------------------- |
| **Purpose**             | Design from requirement; peer review; publish to library            |
| **Dependencies**        | QEP-E-0.5-01; approved requirements                                 |
| **Deliverables**        | AS-04 orchestration; AS-04→AS-03 handoff                            |
| **Acceptance criteria** | Design cannot publish without approval; links to source requirement |
| **Complexity**          | L                                                                   |
| **Parallelisation**     | Sequential handoff to library                                       |
| **Risk**                | Orchestration failures — **mitigate:** transactional outbox pattern |

### QEP-E-0.5-03 — Verification Library module (M04)

| Field                   | Value                                       |
| ----------------------- | ------------------------------------------- |
| **Purpose**             | M04 browse, version, reuse, tag, retire UI  |
| **Dependencies**        | QEP-E-0.5-01                                |
| **Deliverables**        | M04 module; library views                   |
| **Acceptance criteria** | Reuse from template demonstrated            |
| **Complexity**          | M                                           |
| **Parallelisation**     | Parallel with M05 after E-0.5-02 interfaces |
| **Risk**                | Low                                         |

### QEP-E-0.5-04 — Verification Design module (M05)

| Field                   | Value                                                           |
| ----------------------- | --------------------------------------------------------------- |
| **Purpose**             | M05 author, peer review, approve, coverage impact basic         |
| **Dependencies**        | QEP-E-0.5-02                                                    |
| **Deliverables**        | M05 module; Playwright design-to-library scenario               |
| **Acceptance criteria** | Manual creation primary path; AI draft controls absent/disabled |
| **Complexity**          | L                                                               |
| **Parallelisation**     | Parallel with M04                                               |
| **Risk**                | Medium                                                          |

### QEP-E-0.5-05 — Req→verification traceability links

| Field                   | Value                                                  |
| ----------------------- | ------------------------------------------------------ |
| **Purpose**             | AS-09 links requirements to approved verifications     |
| **Dependencies**        | QEP-E-0.5-02; QEP-E-0.4-05                             |
| **Deliverables**        | Link graph updates; gap prep                           |
| **Acceptance criteria** | Link created on design approval; visible in trace stub |
| **Complexity**          | M                                                      |
| **Parallelisation**     | Event-driven parallel                                  |
| **Risk**                | Low                                                    |

### QEP-E-0.5-06 — Verification search provider (M22)

| Field                   | Value                                           |
| ----------------------- | ----------------------------------------------- |
| **Purpose**             | Index library assets on approval                |
| **Dependencies**        | QEP-E-0.5-01                                    |
| **Deliverables**        | Search provider; async indexer                  |
| **Acceptance criteria** | Search finds approved verification by tag/title |
| **Complexity**          | S                                               |
| **Parallelisation**     | Fully parallel                                  |
| **Risk**                | Low                                             |

---

## Release 0.6 — Execution epics

### QEP-E-0.6-01 — ExecutionService core (AS-05)

| Field                   | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| **Purpose**             | Runs, sessions, step results, lifecycle states            |
| **Dependencies**        | Release 0.5 complete                                      |
| **Deliverables**        | AS-05 domain; result mutation audit                       |
| **Acceptance criteria** | Planned→In progress→Completed enforced; mutations audited |
| **Complexity**          | XL                                                        |
| **Parallelisation**     | Split: planning ∥ execution recording after API freeze    |
| **Risk**                | State complexity — **mitigate:** exhaustive state tests   |

### QEP-E-0.6-02 — Session operations (pause, handover, retest queue)

| Field                   | Value                                                      |
| ----------------------- | ---------------------------------------------------------- |
| **Purpose**             | Human-centred session operations per DEF-002               |
| **Dependencies**        | QEP-E-0.6-01                                               |
| **Deliverables**        | Pause/resume; assignee handover; retest queue stub         |
| **Acceptance criteria** | Handover preserves history; pause/resume audited           |
| **Complexity**          | L                                                          |
| **Parallelisation**     | After core session MVP                                     |
| **Risk**                | Concurrency on handover — **mitigate:** optimistic locking |

### QEP-E-0.6-03 — Execution module (M06)

| Field                   | Value                                                    |
| ----------------------- | -------------------------------------------------------- |
| **Purpose**             | M06 plan, assign, execute, complete UI                   |
| **Dependencies**        | QEP-E-0.6-01                                             |
| **Deliverables**        | M06 module; Playwright manual session scenario           |
| **Acceptance criteria** | Full manual session E2E PASS                             |
| **Complexity**          | XL                                                       |
| **Parallelisation**     | UI parallel with E-0.6-02                                |
| **Risk**                | UX complexity for testers — **mitigate:** persona review |

### QEP-E-0.6-04 — Automation registry stub (M07 / AS-06)

| Field                   | Value                                             |
| ----------------------- | ------------------------------------------------- |
| **Purpose**             | Automation asset metadata registry; no ingest     |
| **Dependencies**        | QEP-E-0.6-01                                      |
| **Deliverables**        | AS-06 stub; M07 registry UI                       |
| **Acceptance criteria** | Automation ID fields on procedures; registry CRUD |
| **Complexity**          | S                                                 |
| **Parallelisation**     | Fully parallel                                    |
| **Risk**                | Low                                               |

### QEP-E-0.6-05 — Execution trace links and search

| Field                   | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| **Purpose**             | AS-09 verification→result links; M22 execution provider |
| **Dependencies**        | QEP-E-0.6-01                                            |
| **Deliverables**        | Trace updates on completion; search indexer             |
| **Acceptance criteria** | Completed session appears in trace stub                 |
| **Complexity**          | M                                                       |
| **Parallelisation**     | Event-driven parallel                                   |
| **Risk**                | Low                                                     |

---

## Release 0.7 — Evidence and traceability epics

### QEP-E-0.7-01 — EvidenceService (AS-08)

| Field                   | Value                                                        |
| ----------------------- | ------------------------------------------------------------ |
| **Purpose**             | Evidence items, blob refs via DocumentService, pack assembly |
| **Dependencies**        | Release 0.6 complete; Platform DocumentService               |
| **Deliverables**        | AS-08 service; retention hooks                               |
| **Acceptance criteria** | Evidence attach with lineage; pack reviewable                |
| **Complexity**          | L                                                            |
| **Parallelisation**     | Backend first                                                |
| **Risk**                | Storage quotas — **mitigate:** platform storage policy       |

### QEP-E-0.7-02 — Evidence module (M09)

| Field                   | Value                                             |
| ----------------------- | ------------------------------------------------- |
| **Purpose**             | M09 capture UI during/after execution; pack views |
| **Dependencies**        | QEP-E-0.7-01                                      |
| **Deliverables**        | M09 module; attach from session                   |
| **Acceptance criteria** | Evidence captured in session E2E extended PASS    |
| **Complexity**          | L                                                 |
| **Parallelisation**     | Parallel with traceability after E-0.7-01 API     |
| **Risk**                | Medium                                            |

### QEP-E-0.7-03 — TraceabilityService matrix (AS-09)

| Field                   | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| **Purpose**             | Full link graph; coverage matrix; gap detection       |
| **Dependencies**        | QEP-E-0.6-05; QEP-E-0.5-05                            |
| **Deliverables**        | Matrix views; gap rules; export stub                  |
| **Acceptance criteria** | Gaps visible for unverified requirements              |
| **Complexity**          | L                                                     |
| **Parallelisation**     | Graph engine ∥ UI                                     |
| **Risk**                | Graph performance — **mitigate:** incremental refresh |

### QEP-E-0.7-04 — Traceability module (M10)

| Field                   | Value                                              |
| ----------------------- | -------------------------------------------------- |
| **Purpose**             | M10 matrix UI, gap highlights, link management     |
| **Dependencies**        | QEP-E-0.7-03                                       |
| **Deliverables**        | M10 module; Playwright matrix scenario             |
| **Acceptance criteria** | Matrix shows req→verification→result; gaps flagged |
| **Complexity**          | L                                                  |
| **Parallelisation**     | After graph API stable                             |
| **Risk**                | Medium                                             |

### QEP-E-0.7-05 — Coverage gap alerts on Home (M01)

| Field                   | Value                                      |
| ----------------------- | ------------------------------------------ |
| **Purpose**             | AS-22 widgets surfacing trace gaps         |
| **Dependencies**        | QEP-E-0.7-03                               |
| **Deliverables**        | Gap alert widgets                          |
| **Acceptance criteria** | Home shows gap count for project lead role |
| **Complexity**          | S                                          |
| **Parallelisation**     | Parallel with M10                          |
| **Risk**                | Low                                        |

---

## Release 0.8 — Defects and risk epics

### QEP-E-0.8-01 — DefectService (AS-07)

| Field                   | Value                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| **Purpose**             | Defect lifecycle; link to verification/step; retest coordination |
| **Dependencies**        | Release 0.7 complete                                             |
| **Deliverables**        | AS-07 service; external link field                               |
| **Acceptance criteria** | Defect from failed step; retest completes                        |
| **Complexity**          | L                                                                |
| **Parallelisation**     | Independent of risk service                                      |
| **Risk**                | ITSM scope creep — **mitigate:** DEF-002 exclusions              |

### QEP-E-0.8-02 — Defects module (M08)

| Field                   | Value                                  |
| ----------------------- | -------------------------------------- |
| **Purpose**             | M08 raise, triage, link, retest UI     |
| **Dependencies**        | QEP-E-0.8-01                           |
| **Deliverables**        | M08 module; Playwright defect scenario |
| **Acceptance criteria** | Fail step→defect→retest E2E PASS       |
| **Complexity**          | L                                      |
| **Parallelisation**     | Parallel with risk epic                |
| **Risk**                | Medium                                 |

### QEP-E-0.8-03 — RiskService (AS-10)

| Field                   | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| **Purpose**             | Risk register, scoring, treatment, human acceptance   |
| **Dependencies**        | QEP-E-0.3-01 project context                          |
| **Deliverables**        | AS-10 service; acceptance audit                       |
| **Acceptance criteria** | Risk acceptance requires named human actor            |
| **Complexity**          | M                                                     |
| **Parallelisation**     | Parallel with defects                                 |
| **Risk**                | GRC scope creep — **mitigate:** QEP-scoped risks only |

### QEP-E-0.8-04 — Risk module (M11)

| Field                   | Value                                      |
| ----------------------- | ------------------------------------------ |
| **Purpose**             | M11 register UI, treatment workflow        |
| **Dependencies**        | QEP-E-0.8-03                               |
| **Deliverables**        | M11 module                                 |
| **Acceptance criteria** | Risk linked to project; acceptance audited |
| **Complexity**          | M                                          |
| **Parallelisation**     | Parallel with M08                          |
| **Risk**                | Low                                        |

### QEP-E-0.8-05 — Defect connector config (M19 extension)

| Field                   | Value                               |
| ----------------------- | ----------------------------------- |
| **Purpose**             | External tracker link via AS-18     |
| **Dependencies**        | QEP-E-0.8-01; QEP-E-0.3-03          |
| **Deliverables**        | Connector config for defect tracker |
| **Acceptance criteria** | External URL linked; health visible |
| **Complexity**          | S                                   |
| **Parallelisation**     | Parallel                            |
| **Risk**                | Low                                 |

---

## Release 0.9 — Certification and MVP closure epics

### QEP-E-0.9-01 — ReleaseReadinessService (AS-11)

| Field                   | Value                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| **Purpose**             | Release scope, gates, waivers, readiness snapshots               |
| **Dependencies**        | Releases 0.7–0.8 complete                                        |
| **Deliverables**        | AS-11 service; gate evaluation engine                            |
| **Acceptance criteria** | Snapshot aggregates defects, risk, trace gaps, evidence status   |
| **Complexity**          | XL                                                               |
| **Parallelisation**     | Read models parallel per upstream service                        |
| **Risk**                | Gate rule complexity — **mitigate:** configurable gate templates |

### QEP-E-0.9-02 — CertificationService (AS-12)

| Field                   | Value                                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| **Purpose**             | Cert requests, approvers, human decisions, immutable records                 |
| **Dependencies**        | QEP-E-0.9-01; QEP-E-0.7-01                                                   |
| **Deliverables**        | AS-12 service; evidence lock on decision                                     |
| **Acceptance criteria** | No auto-cert; named certifier; pack locked; immutable decision               |
| **Complexity**          | XL                                                                           |
| **Parallelisation**     | Sequential after readiness                                                   |
| **Risk**                | **High** — Constitution compliance — **mitigate:** cert test suite mandatory |

### QEP-E-0.9-03 — Release Readiness module (M12)

| Field                   | Value                            |
| ----------------------- | -------------------------------- |
| **Purpose**             | M12 gates, waivers, snapshot UI  |
| **Dependencies**        | QEP-E-0.9-01                     |
| **Deliverables**        | M12 module                       |
| **Acceptance criteria** | Readiness review completable     |
| **Complexity**          | L                                |
| **Parallelisation**     | Parallel with cert service build |
| **Risk**                | Medium                           |

### QEP-E-0.9-04 — Certification module (M13)

| Field                   | Value                                                        |
| ----------------------- | ------------------------------------------------------------ |
| **Purpose**             | M13 cert workflow UI                                         |
| **Dependencies**        | QEP-E-0.9-02                                                 |
| **Deliverables**        | M13 module; Playwright full cert path scenario               |
| **Acceptance criteria** | **MVP E2E:** req→verify→execute→evidence→readiness→cert PASS |
| **Complexity**          | XL                                                           |
| **Parallelisation**     | After cert service                                           |
| **Risk**                | High — MVP gate                                              |

### QEP-E-0.9-05 — Quality Intelligence basic (M14 / AS-13)

| Field                   | Value                                                      |
| ----------------------- | ---------------------------------------------------------- |
| **Purpose**             | Derived indicators; non-binding explanations; AI OFF       |
| **Dependencies**        | Upstream events from 0.6–0.8                               |
| **Deliverables**        | AS-13 basic; M14 dashboard widgets                         |
| **Acceptance criteria** | Indicators refresh on events; no SoR mutation              |
| **Complexity**          | M                                                          |
| **Parallelisation**     | Parallel with reporting                                    |
| **Risk**                | Misinterpreted as authority — **mitigate:** UI disclaimers |

### QEP-E-0.9-06 — Reporting module (M15 / AS-14)

| Field                   | Value                                               |
| ----------------------- | --------------------------------------------------- |
| **Purpose**             | Core dashboards; cert export; project/release views |
| **Dependencies**        | All upstream read models                            |
| **Deliverables**        | AS-14; M15 dashboards                               |
| **Acceptance criteria** | Cert pack export; scheduled report stub             |
| **Complexity**          | L                                                   |
| **Parallelisation**     | Dashboards parallel per domain                      |
| **Risk**                | Medium                                              |

### QEP-E-0.9-07 — Full Home Command Centre (M01 / AS-22)

| Field                   | Value                                                |
| ----------------------- | ---------------------------------------------------- |
| **Purpose**             | Complete role-aware widgets, alerts, work queues     |
| **Dependencies**        | All MVP modules                                      |
| **Deliverables**        | Full M01; AS-22 aggregation                          |
| **Acceptance criteria** | Persona-specific landing verified for 5 MVP personas |
| **Complexity**          | L                                                    |
| **Parallelisation**     | Widgets parallel per upstream                        |
| **Risk**                | Medium                                               |

---

## Release 1.0 — GA epics

### QEP-E-1.0-01 — MVP module hardening pass

| Field                   | Value                                               |
| ----------------------- | --------------------------------------------------- |
| **Purpose**             | M01–M15 performance, a11y, bug fix, UX polish       |
| **Dependencies**        | Release 0.9 MVP tag                                 |
| **Deliverables**        | Hardening backlog cleared; axe AA PASS all modules  |
| **Acceptance criteria** | No P0/P1 open; regression PASS                      |
| **Complexity**          | XL                                                  |
| **Parallelisation**     | Per-module teams parallel                           |
| **Risk**                | Schedule slip — **mitigate:** freeze features early |

### QEP-E-1.0-02 — Phase 2 scaffolds (M16–M18 OFF)

| Field                   | Value                                                        |
| ----------------------- | ------------------------------------------------------------ |
| **Purpose**             | Knowledge, AI Workspace, MCP catalogue — disabled            |
| **Dependencies**        | QEP-E-1.0-01                                                 |
| **Deliverables**        | AS-15/16/17 scaffolds; M16–M18 nav hidden by permission      |
| **Acceptance criteria** | Feature flags OFF; no MVP path dependency                    |
| **Complexity**          | M                                                            |
| **Parallelisation**     | Fully parallel                                               |
| **Risk**                | Accidental enablement — **mitigate:** default deny in config |

### QEP-E-1.0-03 — Integration depth (M19)

| Field                   | Value                                             |
| ----------------------- | ------------------------------------------------- |
| **Purpose**             | GitHub ingest foundation; connector hardening     |
| **Dependencies**        | QEP-E-0.8-05                                      |
| **Deliverables**        | CI connector MVP; sync status                     |
| **Acceptance criteria** | GitHub reference link operational                 |
| **Complexity**          | L                                                 |
| **Parallelisation**     | Parallel with hardening                           |
| **Risk**                | Connector auth — **mitigate:** OAuth via platform |

### QEP-E-1.0-04 — Administration and audit GA (M20, M21)

| Field                   | Value                                                   |
| ----------------------- | ------------------------------------------------------- |
| **Purpose**             | Entitlements, retention enforcement, audit export packs |
| **Dependencies**        | QEP-E-0.9-02                                            |
| **Deliverables**        | M20 entitlements; M21 cert investigation export         |
| **Acceptance criteria** | Legal hold coordination documented                      |
| **Complexity**          | M                                                       |
| **Parallelisation**     | Parallel                                                |
| **Risk**                | Low                                                     |

### QEP-E-1.0-05 — Production readiness and deployment

| Field                   | Value                                                          |
| ----------------------- | -------------------------------------------------------------- |
| **Purpose**             | Production deploy pack; runbooks; monitoring dashboards        |
| **Dependencies**        | QEP-E-1.0-01                                                   |
| **Deliverables**        | DEPLOYMENT runbook; health checks; SLO draft                   |
| **Acceptance criteria** | Staging and production-like deploy PASS                        |
| **Complexity**          | L                                                              |
| **Parallelisation**     | DevOps lead; parallel with hardening                           |
| **Risk**                | **High** — production incidents — **mitigate:** staged rollout |

### QEP-E-1.0-06 — GA documentation and Owner acceptance

| Field                   | Value                                           |
| ----------------------- | ----------------------------------------------- |
| **Purpose**             | User docs, operator docs, GA evidence pack      |
| **Dependencies**        | QEP-E-1.0-05                                    |
| **Deliverables**        | Documentation complete; GA acceptance checklist |
| **Acceptance criteria** | Owner GA Acceptance recorded; tag `qep-v1.0.0`  |
| **Complexity**          | M                                               |
| **Parallelisation**     | Docs parallel throughout 1.0                    |
| **Risk**                | Low                                             |

---

## Module-to-epic coverage matrix (M01–M22)

| Module | Epic IDs                                                       |
| ------ | -------------------------------------------------------------- |
| M01    | QEP-E-0.2-06, E-0.3-05, E-0.7-05, E-0.9-07, E-1.0-01           |
| M02    | QEP-E-0.3-02, E-1.0-01                                         |
| M03    | QEP-E-0.4-04, E-1.0-01                                         |
| M04    | QEP-E-0.5-03, E-1.0-01                                         |
| M05    | QEP-E-0.5-04, E-1.0-01                                         |
| M06    | QEP-E-0.6-03, E-1.0-01                                         |
| M07    | QEP-E-0.6-04, E-1.0-03                                         |
| M08    | QEP-E-0.8-02, E-1.0-01                                         |
| M09    | QEP-E-0.7-02, E-1.0-01                                         |
| M10    | QEP-E-0.4-05, E-0.5-05, E-0.6-05, E-0.7-03, E-0.7-04, E-1.0-01 |
| M11    | QEP-E-0.8-04, E-1.0-01                                         |
| M12    | QEP-E-0.9-03, E-1.0-01                                         |
| M13    | QEP-E-0.9-04, E-1.0-01                                         |
| M14    | QEP-E-0.9-05, E-1.0-01, E-1.0-02                               |
| M15    | QEP-E-0.9-06, E-1.0-01                                         |
| M16    | QEP-E-1.0-02                                                   |
| M17    | QEP-E-1.0-02                                                   |
| M18    | QEP-E-1.0-02                                                   |
| M19    | QEP-E-0.3-03, E-0.8-05, E-1.0-03                               |
| M20    | QEP-E-0.2-03, E-1.0-04                                         |
| M21    | QEP-E-0.2-04, E-1.0-04                                         |
| M22    | QEP-E-0.2-05, E-0.4-05, E-0.5-06, E-0.6-05, E-1.0-01           |

**Confirmation:** All 22 modules mapped to at least one epic.

---

## Document control

| Version    | Date       | Change                                      |
| ---------- | ---------- | ------------------------------------------- |
| 1.0.0-plan | 2026-07-24 | Initial epics — 55 epics across 10 releases |
