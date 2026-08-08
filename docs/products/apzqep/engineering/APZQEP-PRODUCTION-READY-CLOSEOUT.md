# APZQEP — Production Ready Closeout Inventory

| Field        | Value                                                                                |
| ------------ | ------------------------------------------------------------------------------------ |
| Document     | **APZQEP-PRODUCTION-READY-CLOSEOUT**                                                 |
| Kind         | Finite closeout inventory — **ACCEPTED**                                             |
| Timestamp    | 20260807T180500Z                                                                     |
| Authority    | [OWNER-DECISION-V1.1-PRODUCTION-READY.md](./OWNER-DECISION-V1.1-PRODUCTION-READY.md) |
| Method       | Same closeout discipline as APZ Projects Release 3.0                                 |
| Engineering  | **Phase 2 CLOSED** — enter Hardening (H1–H5) · no new product functionality          |
| Success      | **APZQEP Version 1.1 – Enterprise Quality Baseline — Production Ready**              |
| Next product | Only after formal close — no product switching mid-closeout                          |

**Authoritative status face:** [PRODUCT-STATUS.md](../PRODUCT-STATUS.md)  
**V1.1 freeze:** [apzqep-version-1.1-architecture-freeze/](../v1.1/apzqep-version-1.1-architecture-freeze/)  
**Projects method reference:** [RELEASE-3.0-CLOSEOUT.md](../../apzprojects/release-3.0/RELEASE-3.0-CLOSEOUT.md)

---

## Assessment verdict

```text
APZQEP Version 1.0
  → GENERAL AVAILABILITY / Production Ready
  → Engineering CLOSED (do not reopen)

APZQEP Version 1.1 (Enterprise Quality Baseline)
  → FEATURE COMPLETE · ARCHITECTURE FROZEN
  → CERTIFIED FOR INTERNAL PRODUCTION ADOPTION only
  → Not yet Production Ready for unrestricted enterprise baseline use

Primary remaining gap
  → V1.1 durability + adoption evidence + Production Ready release closeout
  → Not missing Wave features
  → Not architecture redesign
```

**Owner target language note:** The directive names “APZQEP Version 1.0 — Production Ready.” Repository truth is that **V1.0 already holds that posture** (PBR-APZQEP-1.0-001 GO · 150R PASS · OPS-001 COMPLETE). The unfinished Production Ready surface is the **Enterprise Quality Baseline delivered as Version 1.1**. This inventory closes that gap without recreating V1.0 work or opening Wave 166 / 170+.

---

## Already complete — do not recreate

| Layer                                                                                     | Status                      | Authority                             |
| ----------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------- |
| APZQEP-120 Platform Foundation                                                            | CERTIFIED / CLOSED          | PRODUCT-STATUS                        |
| APZQEP-140 Core QE Caps A–F (eng + Postgres SoR)                                          | CERTIFIED / CLOSED          | PRODUCT-STATUS · `qep-core-qe-schema` |
| Foundation domains (requirements, specs, plans, TE, evidence, traceability, verification) | 1.0.x packages present      | packages/qep-*                        |
| APZQEP-151 Durable Persistence (RB-001)                                                   | CERTIFIED / CLOSED          | PRODUCT-STATUS                        |
| APZQEP-152 Production Security (RB-002)                                                   | CERTIFIED / CLOSED          | PRODUCT-STATUS                        |
| APZQEP-150R Readiness Re-certification                                                    | PASS — GO recommended       | apzqep-150r                           |
| PBR-APZQEP-1.0-001                                                                        | GO — GA authorised          | pbr-apzqep-1.0-001                    |
| APZQEP-OPS-001 GA Operations                                                              | COMPLETE                    | apzqep-ops-001                        |
| APZQEP-160…165 Waves 1–5 features                                                         | COMPLETE / CERTIFIED        | WAVE-PROGRESS-REGISTER                |
| APZQEP-165-QO-001…018                                                                     | COMPLETE · QO-018 CERTIFIED | freeze pack                           |
| V1.1 Architecture Freeze / Feature Complete                                               | FROZEN                      | ENTERPRISE-QUALITY-BASELINE           |
| APZ Projects Release 3.0                                                                  | PRODUCTION READY · CLOSED   | apzprojects/release-3.0               |

Stale assessments (e.g. `v1.1/CURRENT-CAPABILITY-ASSESSMENT.md` dated 2026-08-01) are **not** authoritative when they conflict with PRODUCT-STATUS.

---

## Current posture (verified)

| Area                                                             | State                                                                       |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| V1.0 release blockers                                            | **NONE** (RB-001/RB-002 cleared)                                            |
| V1.0 package promotion Caps A–F                                  | **Executed** under QX-PR-06 — Caps A–F at 1.0.0                             |
| Wave 1 Automation SoR                                            | `InMemoryExecutionStore` only — **not production-durable**                  |
| Wave 2 SCM SoR                                                   | `InMemoryRepositoryStore` only — **not production-durable**                 |
| Wave 3 QI SoR                                                    | PostgreSQL `IntelligenceStore` — production default via resolver (QX-PR-03) |
| Wave 4 Dashboard SoR                                             | PostgreSQL `LayoutStore` — production default via resolver (QX-PR-04)       |
| Wave 5 Orchestration SoRs                                        | Process-local `Map` stores across QO engines — **no Postgres schema**       |
| V1.1 Postgres tables (automation/scm/QI/dashboard/orchestration) | **Absent** under `packages/config/src/db`                                   |
| Orchestration HTTP/module surface in `apps/web`                  | **Not found**                                                               |
| ADOPT-001 Phase 1 Track A daily-use checklist                    | All rows **Pending**                                                        |
| Friction log / dogfood evidence                                  | Empty / pending                                                             |
| Wave 166 · 163A · 170/180/190/200                                | **NOT AUTHORISED** — out of scope for this closeout                         |

---

## Phase 1 — Remaining Product Functionality

**Deliverable:** Usable Enterprise Quality Baseline experience for Production Ready — no new waves, no architecture reopen.

| ID       | Description                                                                                                                                                      | Current Status                                                                                                                                                                   | Dependency                                                                                           | Complexity | Acceptance Criteria                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| QX-P1-01 | Cap shell navigation permission filtering (PRODUCT-STATUS residual KI-001)                                                                                       | **Closed** — ([evidence/QX-P1-01-CAP-SHELL-NAV-PERMISSION-FILTER.md](./evidence/QX-P1-01-CAP-SHELL-NAV-PERMISSION-FILTER.md))                                                    | PermissionService · Cap modules                                                                      | S          | Cap Activity Bar / Sidebar entries hidden when user lacks permission; no pre-API false affordance                 |
| QX-P1-02 | Dashboard projection ports — replace demo/placeholder KPIs with Reporting / QI / Evidence reads (or honest empty)                                                | **Closed** — honest empty ([evidence/QX-P1-02-DASHBOARD-HONEST-EMPTY-PROJECTIONS.md](./evidence/QX-P1-02-DASHBOARD-HONEST-EMPTY-PROJECTIONS.md))                                 | Wave 3–4 APIs · `qep-dashboards`                                                                     | M          | Persona dashboards show SoR-attributed data or honest empty states; no fabricated KPI values                      |
| QX-P1-03 | Quality Flow Workspace (operable surface for flows + Decision Packages)                                                                                          | **Closed** — Owner CONDITIONALLY ACCEPTED; smoke/resilience/performance evidence PASS ([evidence/QX-P1-03-OPERATIONAL-EVIDENCE.md](./evidence/QX-P1-03-OPERATIONAL-EVIDENCE.md)) | [OWNER-REVIEW-QX-P1-03-QUALITY-FLOW-WORKSPACE.md](./OWNER-REVIEW-QX-P1-03-QUALITY-FLOW-WORKSPACE.md) | L          | Workspace route(s) to start/view Quality Flow + Decision Package; permission-filtered; no composition-only waiver |
| QX-P1-04 | ADOPT-001 Phase 1 Track A capability exercise (use, not redesign): workspace · flows · decisions · evidence · approvals · executive · ops · workspace experience | **Closed** — with QX-PR-08 ([evidence/QX-PR-08-ADOPT-TRACK-A-EVIDENCE.md](./evidence/QX-PR-08-ADOPT-TRACK-A-EVIDENCE.md))                                                        | ADOPT-001 · QX-P1-03                                                                                 | M          | Each Track A row exercised with timestamped evidence; frictions recorded in FRICTION-LOG                          |
| QX-P1-05 | Project membership attribute refinement (PRODUCT-STATUS residual KI-002)                                                                                         | **Deferred → V1.2** — ([evidence/QX-P1-05-PROJECT-MEMBERSHIP-ACL-DEFER.md](./evidence/QX-P1-05-PROJECT-MEMBERSHIP-ACL-DEFER.md))                                                 | Identity / Cap authz                                                                                 | S          | Membership attributes consistent with fail-closed Cap RBAC; documented                                            |

**Phase 1 exit:** All QX-P1-\* Accepted or formally waived by Owner with written exception; no missing daily-use surface without waiver.

---

## Phase 2 — Production Readiness

**Deliverable:** No production blockers for Enterprise Quality Baseline durability and ops readiness.

| ID           | Description                                                                                                                                            | Current Status                                                                                                                                                      | Dependency                            | Complexity | Acceptance Criteria                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| **QX-PR-01** | Durable Postgres persistence for Automation execution store                                                                                            | **Closed** — env evidence PASS ([evidence/QX-PR-01-AUTOMATION-DURABILITY-EVIDENCE.md](./evidence/QX-PR-01-AUTOMATION-DURABILITY-EVIDENCE.md))                       | Schema + migration + runtime resolver | L          | Survives process restart; tenant-scoped; production runtime uses Postgres by default; Wave 1 residual cleared |
| **QX-PR-02** | Durable Postgres persistence for SCM repository / webhook stores                                                                                       | **Closed** — env evidence PASS ([evidence/QX-PR-02-SCM-DURABILITY-EVIDENCE.md](./evidence/QX-PR-02-SCM-DURABILITY-EVIDENCE.md))                                     | PR-01 pattern                         | L          | Same durability bar as PR-01 for SCM artefacts                                                                |
| **QX-PR-03** | Durable Postgres persistence for QI observations / signals / recommendations / explanations / scores / audit                                           | **Closed** — env evidence PASS ([evidence/QX-PR-03-QI-DURABILITY-EVIDENCE.md](./evidence/QX-PR-03-QI-DURABILITY-EVIDENCE.md))                                       | PR-01 pattern                         | L          | PRODUCT-STATUS “not production-durable” line for Wave 3 cleared; immutable observation rules preserved        |
| **QX-PR-04** | Durable Postgres persistence for Dashboard layouts / saved views                                                                                       | **Closed** — env evidence PASS ([evidence/QX-PR-04-DASHBOARD-DURABILITY-EVIDENCE.md](./evidence/QX-PR-04-DASHBOARD-DURABILITY-EVIDENCE.md))                         | PR-01 pattern                         | M          | Layouts survive restart; fail-closed authz; Wave 4 residual cleared                                           |
| **QX-PR-05** | Durable Postgres persistence for Orchestration SoRs (flows, gates, approvals, decisions, events, coordination packages per SYSTEM-OF-RECORD-CATALOGUE) | **Closed** — env evidence PASS ([evidence/QX-PR-05-ORCHESTRATION-DURABILITY-EVIDENCE.md](./evidence/QX-PR-05-ORCHESTRATION-DURABILITY-EVIDENCE.md))                 | SYSTEM-OF-RECORD-CATALOGUE · QO packs | **XL**     | Authoritative SoRs durable; process-local not default in production; migration verified                       |
| QX-PR-06     | Cap A–F package promotion 0.1.0 → 1.0.0 under existing release governance (KI-003)                                                                     | **Closed** — promoted to 1.0.0; 41/41 Cap tests PASS ([evidence/QX-PR-06-CAP-PACKAGE-PROMOTION-EVIDENCE.md](./evidence/QX-PR-06-CAP-PACKAGE-PROMOTION-EVIDENCE.md)) | Release governance                    | S          | Versions match GA posture; promotion evidence recorded                                                        |
| QX-PR-07     | Persistence / production-durability re-certification pack for Waves 1–5                                                                                | **Closed** — Waves 1–5 audit PASS ([evidence/QX-PR-07-DURABILITY-RECERTIFICATION.md](./evidence/QX-PR-07-DURABILITY-RECERTIFICATION.md))                            | PR-01…05                              | M          | Audit PASS for durable SoR; PRODUCT-STATUS durability lines updated                                           |
| QX-PR-08     | Close ADOPT-001 Phase 1 Track A + first dogfood / Week-1 evidence                                                                                      | **Closed** — Track A Done ([evidence/QX-PR-08-ADOPT-TRACK-A-EVIDENCE.md](./evidence/QX-PR-08-ADOPT-TRACK-A-EVIDENCE.md))                                            | QX-P1-04 · ops use                    | M          | Phase 1 checklist Done; evidence under `evidence/apzqep-adopt-001/`                                           |
| QX-PR-09     | Migration verification on all supported envs for new V1.1 tables                                                                                       | **Closed** — apzhub + apzhub_test PASS ([evidence/QX-PR-09-MIGRATION-VERIFICATION.md](./evidence/QX-PR-09-MIGRATION-VERIFICATION.md))                               | PR-01…05                              | M          | Apply/verify PASS on every supported environment target                                                       |

**Phase 2 exit:** PR-01…09 closed or Owner-waived; no Blocking durability items remain.

---

## Phase 3 — Hardening

**Deliverable:** Release Candidate — zero Critical / High open defects on the Production Ready baseline.

| ID       | Description                                                        | Current Status                                                                                                         | Dependency   | Complexity | Acceptance Criteria                     |
| -------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- | --------------------------------------- |
| QX-HD-01 | H1 Functional Regression — Playwright V1.1 journeys                | **Closed** ([evidence/QX-HD-01-FUNCTIONAL-REGRESSION.md](./evidence/QX-HD-01-FUNCTIONAL-REGRESSION.md))                | Phase 2 · UI | L          | Critical journeys green in CI           |
| QX-HD-02 | H3 Performance — measure; optimise only on evidence                | **Closed** ([evidence/QX-HD-H3-PERFORMANCE.md](./evidence/QX-HD-H3-PERFORMANCE.md))                                    | H1           | L          | Budgets met; no optimisation required   |
| QX-HD-03 | H4 Security — permissions, tenant, evidence, audit, QFW, API authz | **Closed** ([evidence/QX-HD-H4-SECURITY.md](./evidence/QX-HD-H4-SECURITY.md))                                          | PR-01…05     | M          | Review recorded; Critical/High = 0      |
| QX-HD-04 | H2 Accessibility — responsive · keyboard · focus · SR · colour     | **Closed** ([evidence/QX-HD-04-H2-ACCESSIBILITY.md](./evidence/QX-HD-04-H2-ACCESSIBILITY.md))                          | UI           | M          | Zero Critical · Zero High               |
| QX-HD-05 | H5 Operational Readiness + defect burn-down to zero C/H            | **Closed** ([evidence/QX-HD-H5-OPERATIONAL-READINESS.md](./evidence/QX-HD-H5-OPERATIONAL-READINESS.md)); RC1 submitted | HD-01…04     | M          | Defect board empty at C/H; RC submitted |

**Phase 3 exit:** RC build; certification evidence pack draft started.

---

## Phase 4 — Release

**Deliverable:** Tagged Enterprise Quality Baseline · status **PRODUCTION READY** · frozen except defects.

| ID       | Description                                                                                                   | Current Status                                                       | Dependency | Complexity | Acceptance Criteria                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------- | ---------- | ----------------------------------------------------------------------- |
| QX-RL-01 | V1.1 / Baseline Release Notes (known limitations cleared or waived)                                           | Not started for Production Ready beyond Internal Adoption            | Phase 3    | S          | User-visible delta vs Internal Adoption certification                   |
| QX-RL-02 | Ops / Admin / User guides updated for durable V1.1 baseline                                                   | OPS-001 was V1.0-era                                                 | Phase 2–3  | M          | Runbooks cover V1.1 SoRs, health, migrations, degrade paths             |
| QX-RL-03 | Certification evidence pack (durability + E2E + security + a11y)                                              | QO-018 is conformance/internal-adoption only                         | Phase 3    | M          | Board-ready evidence pack complete                                      |
| QX-RL-04 | Product Board / Owner resolution: Enterprise Quality Baseline **Production Ready** (beyond Internal Adoption) | Missing                                                              | RL-01…03   | S          | Written GO; PRODUCT-STATUS and portfolio faces updated                  |
| QX-RL-05 | Tag + freeze production baseline; engineering CLOSED except defects                                           | Architecture freeze exists; Production Ready tag/declaration missing | RL-04      | S          | Tag on main; Owner declaration recorded; no product switch before close |

**Phase 4 exit:** Baseline frozen Production Ready; engineering may start next APZHUB product (APZ Workflow per Owner portfolio order).

---

## Explicitly out of scope (this closeout)

| ID          | Item                                                             | Status                              | Rule                                          |
| ----------- | ---------------------------------------------------------------- | ----------------------------------- | --------------------------------------------- |
| QX-OOS-166  | APZQEP-166 Enterprise Ecosystem                                  | NOT AUTHORISED                      | Do not open                                   |
| QX-OOS-163A | External AI providers                                            | NOT AUTHORISED                      | Do not open                                   |
| QX-OOS-170+ | Provider families (Playwright production, SCM, QI, integrations) | NOT AUTHORISED — backlog seeds only | Await adoption lessons after Production Ready |
| QX-OOS-ARCH | Revisit Wave 1–5 architecture / freeze                           | CLOSED                              | Do not reopen                                 |
| QX-OOS-V10  | Reopen 120 / 140 / 150 / 151 / 152 / 150R / PBR-1.0-001          | CLOSED                              | Immutable / complete                          |

---

## Execution order (recommended)

1. Accept this inventory (Owner) — no coding until accepted.
2. **Phase 2 durability first** for orchestration + Wave 1–4 stores (PR-01…05) — these are the Production Ready blockers.
3. Close Phase 1 residuals that affect daily use (P1-01…03) in parallel where they do not depend on durability.
4. PR-06 promotion + PR-09 migrations continuously once schemas exist.
5. PR-07 / PR-08 certification + ADOPT evidence when durable paths exist.
6. Phase 3 only after Phase 1–2 exit (or Owner-approved exceptions).
7. Phase 4 then **stop** — next product only after Production Ready declaration.

---

## Reporting cadence

Report only:

- Phase 1 — Completed / In Progress / Remaining
- Phase 2 — Completed / Blocking / Remaining
- Phase 3 — Completed / In Progress / Remaining
- Phase 4 — Completed / Remaining

Do not invent new programmes. Do not invent new workshops. Raise conflicts with PRODUCT-STATUS or the V1.1 freeze to the Owner.

---

## Owner decisions — RESOLVED (20260807T180500Z)

| Decision                        | Resolution                                                              |
| ------------------------------- | ----------------------------------------------------------------------- |
| Inventory acceptance            | **ACCEPTED**                                                            |
| Target designation              | **APZQEP Version 1.1 – Enterprise Quality Baseline — Production Ready** |
| QX-P1-03 Quality Flow Workspace | **IMPLEMENT — do not waive**                                            |
| Engineering start               | **QX-PR-05 + QX-PR-01** immediately                                     |

See [OWNER-DECISION-V1.1-PRODUCTION-READY.md](./OWNER-DECISION-V1.1-PRODUCTION-READY.md).
