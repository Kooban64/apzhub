# Programme Backlog — APZQEP v1.1

Prioritised product backlog. Engineering is **not** authorised until Owner approval of APZQEP-110 and a subsequent programme directive.

Priority: **P0** must-have for 1.1 · **P1** should-have · **P2** 1.2 · **P3** later

---

## P0 — Trust & operating model

### BK-001 — Evidence durable storage decision & path

| Field               | Value                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Description         | Resolve ADR-0088; implement Owner-selected durable SoR path for Evidence (or explicit deferred design with timeline)                       |
| Business value      | Unblocks trust and future GA                                                                                                               |
| Priority            | P0                                                                                                                                         |
| Dependencies        | APZQEP-111; Owner storage decision                                                                                                         |
| Programme           | APZQEP-112                                                                                                                                 |
| Release             | 1.1                                                                                                                                        |
| Acceptance criteria | ADR updated or addendum; persistence not memory-only **or** Owner-signed deferral with date; CERT limitation register updated; no GA claim |

### BK-002 — Evidence enumeration ACL (L-EM-01)

| Field               | Value                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------- |
| Description         | Enforce per-item ACL on list/search consistent with read model                         |
| Business value      | Security correctness for LA pilots                                                     |
| Priority            | P0                                                                                     |
| Dependencies        | BK-001 soft                                                                            |
| Programme           | APZQEP-112                                                                             |
| Release             | 1.1                                                                                    |
| Acceptance criteria | Unauthorised items never returned; tests prove deny; limitation closed or reclassified |

### BK-003 — Test Execution authenticated E2E (L-OP-01)

| Field               | Value                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| Description         | Complete critical authenticated Playwright journeys for TE                |
| Business value      | Operability confidence                                                    |
| Priority            | P0                                                                        |
| Dependencies        | APZQEP-113                                                                |
| Programme           | APZQEP-113                                                                |
| Release             | 1.1                                                                       |
| Acceptance criteria | Agreed journey set green in CI; L-OP-01 closed or Owner-accepted residual |

### BK-004 — Domain event publication (TE + Evidence)

| Field               | Value                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Description         | Publish past-tense domain events to platform bus; enable notifications/search indexing          |
| Business value      | Platform integration; attention engine                                                          |
| Priority            | P0                                                                                              |
| Dependencies        | Event SDK; APZQEP-113/112                                                                       |
| Programme           | APZQEP-113 (TE) · APZQEP-112 (Evidence)                                                         |
| Release             | 1.1                                                                                             |
| Acceptance criteria | event.yaml manifests; at-least-once publish; subscribers documented; L-03/L-EM-EVT-01 addressed |

### BK-005 — Test Suites capability

| Field               | Value                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Description         | Suite aggregate: create/version/associate specs; Workbench + API                             |
| Business value      | Industry-standard test organisation                                                          |
| Priority            | P0                                                                                           |
| Dependencies        | APZQEP-111; Test Specs 1.0                                                                   |
| Programme           | APZQEP-114                                                                                   |
| Release             | 1.1                                                                                          |
| Acceptance criteria | Lifecycle + permissions + Workbench CRUD; module not stub; CERT-class programme path defined |

### BK-006 — Test Runs capability

| Field               | Value                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| Description         | Run instances from plans/suites; progress; result rollup; link executions |
| Business value      | Daily QA operating model                                                  |
| Priority            | P0                                                                        |
| Dependencies        | BK-005; TE                                                                |
| Programme           | APZQEP-115                                                                |
| Release             | 1.1                                                                       |
| Acceptance criteria | Run lifecycle; assignment; progress views; API + Workbench; events        |

### BK-007 — Defects capability

| Field               | Value                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| Description         | Native defect lifecycle linked to runs/executions/evidence/requirements |
| Business value      | Close the quality loop inside APZQEP                                    |
| Priority            | P0                                                                      |
| Dependencies        | BK-006 preferred                                                        |
| Programme           | APZQEP-116                                                              |
| Release             | 1.1                                                                     |
| Acceptance criteria | States, links, permissions, Workbench; no mandatory Jira in 1.1         |

---

## P1 — Discovery, insight, AI

### BK-008 — Unified QEP search

| Field               | Value                                                                           |
| ------------------- | ------------------------------------------------------------------------------- |
| Description         | Extend search-qep to specs, plans, executions, evidence, suites, runs, defects  |
| Business value      | Findability                                                                     |
| Priority            | P1                                                                              |
| Dependencies        | Indexing events (BK-004)                                                        |
| Programme           | APZQEP-117                                                                      |
| Release             | 1.1                                                                             |
| Acceptance criteria | Permission-filtered query; providers registered; no standalone module search UI |

### BK-009 — QEP Command Palette actions

| Field               | Value                                                          |
| ------------------- | -------------------------------------------------------------- |
| Description         | Register create/navigate/AI-draft commands via UCP             |
| Business value      | Tester velocity                                                |
| Priority            | P1                                                             |
| Dependencies        | Platform command framework                                     |
| Programme           | APZQEP-117                                                     |
| Release             | 1.1                                                            |
| Acceptance criteria | Top 10 actions; permission-filtered; path Command→Service only |

### BK-010 — QEP notifications

| Field               | Value                                                          |
| ------------------- | -------------------------------------------------------------- |
| Description         | Attention delivery for assignment, fail, review, seal requests |
| Business value      | Responsiveness                                                 |
| Priority            | P1                                                             |
| Dependencies        | BK-004                                                         |
| Programme           | APZQEP-117                                                     |
| Release             | 1.1                                                            |
| Acceptance criteria | Modules publish events only; Notification Framework delivers   |

### BK-011 — Role dashboards & QEP Home

| Field               | Value                                                             |
| ------------------- | ----------------------------------------------------------------- |
| Description         | Home + QA/Tester/Risk dashboards per UX strategy                  |
| Business value      | Situational awareness                                             |
| Priority            | P1                                                                |
| Dependencies        | BK-006/007                                                        |
| Programme           | APZQEP-118                                                        |
| Release             | 1.1                                                               |
| Acceptance criteria | Permission-aware; tokens only; AA smoke; no executive vanity pack |

### BK-012 — Release readiness MVP

| Field               | Value                                                      |
| ------------------- | ---------------------------------------------------------- |
| Description         | Surface blockers: open defects, failed runs, evidence gaps |
| Business value      | Release decisions                                          |
| Priority            | P1                                                         |
| Dependencies        | BK-011                                                     |
| Programme           | APZQEP-118                                                 |
| Release             | 1.1                                                        |
| Acceptance criteria | Read-only readiness view; no auto-release                  |

### BK-013 — AI Assist MVP

| Field               | Value                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| Description         | Guardrails + RAG + human approval for req analysis, test gen draft, evidence summary, release narrative, chat |
| Business value      | Differentiation; productivity                                                                                 |
| Priority            | P1                                                                                                            |
| Dependencies        | BK-008; AI Framework                                                                                          |
| Programme           | APZQEP-119                                                                                                    |
| Release             | 1.1                                                                                                           |
| Acceptance criteria | No write without approve; full audit; eval golden set; kill switch                                            |

### BK-014 — v1.1 certification & limited release

| Field               | Value                                                   |
| ------------------- | ------------------------------------------------------- |
| Description         | Certify 1.1 increments; Owner limited release           |
| Business value      | Controlled production use                               |
| Priority            | P1                                                      |
| Dependencies        | P0/P1 delivery set                                      |
| Programme           | APZQEP-120                                              |
| Release             | 1.1                                                     |
| Acceptance criteria | CERT pack; freeze/release per Lifecycle; GA not implied |

---

## P2 — Enterprise depth (1.2)

| ID     | Description                                          | Priority | Programme | Release |
| ------ | ---------------------------------------------------- | -------- | --------- | ------- |
| BK-020 | Coverage engine                                      | P2       | 121       | 1.2     |
| BK-021 | Impact analysis                                      | P2       | 121       | 1.2     |
| BK-022 | Certification Engine product                         | P2       | 122       | 1.2     |
| BK-023 | Jira sync                                            | P2       | 123       | 1.2     |
| BK-024 | Documents integration                                | P2       | 123       | 1.2     |
| BK-025 | Analytics + Executive dashboard                      | P2       | 124       | 1.2     |
| BK-026 | AI optimisation / regression / defect classify / RCA | P2       | 119+      | 1.2     |
| BK-027 | QEP Administration module                            | P2       | —         | 1.2     |

---

## P3 — Assurance & 2.0

| ID     | Description                | Priority | Programme | Release |
| ------ | -------------------------- | -------- | --------- | ------- |
| BK-030 | Unified audit explorer     | P3       | 125       | 1.3     |
| BK-031 | Compliance export packs    | P3       | 125       | 1.3     |
| BK-032 | GA readiness Evidence + TE | P3       | 126       | 1.3     |
| BK-040 | Portfolio QE architecture  | P3       | 200       | 2.0     |

---

## Explicit non-items (rejected for 1.1)

| Idea                                           | Reason                                    |
| ---------------------------------------------- | ----------------------------------------- |
| Redesign frozen Requirements–Plans domains     | Out of scope; enhancement only with Owner |
| Autonomous AI release/certify                  | Violates AI Framework                     |
| Unrestricted GA by default                     | Separate Owner gate                       |
| Competitor feature parity checklist as backlog | Directional only                          |
| Foundation/governance rewrite                  | FOUNDATION-002 closed                     |

---

## Board decision checklist

- [ ] Approve APZQEP-110 planning pack
- [ ] Confirm ADR-0088 direction for Evidence storage
- [ ] Authorise **APZQEP-111** (Architecture) as first engineering programme
- [ ] Confirm 1.1 availability class expectation (expanded LA vs other)
