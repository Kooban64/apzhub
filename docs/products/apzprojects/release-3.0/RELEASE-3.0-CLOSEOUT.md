# APZ Projects Release 3.0 — Closeout Inventory

| Field        | Value                                              |
| ------------ | -------------------------------------------------- |
| Objective    | **Close APZ Projects Release 3.0**                 |
| Authority    | W002–W011 (approved) — no new workshops            |
| Success      | **Production Ready** · certified · tagged · frozen |
| Next product | Only after formal close                            |

**Already complete (do not re-open as design):** Product Bible · Lifecycle · Operational engine · Workspace shell · Cockpit shell.

**Owner execution IDs (Closeout Mode):**

| Owner ID | Scope                                                                                       |
| -------- | ------------------------------------------------------------------------------------------- |
| PX-01    | Operational Workspace fidelity (all remaining W002) — **do not start Portfolio until done** |
| PX-02    | Portfolio UI (W005)                                                                         |
| PX-03    | Resource & Team UI (W006)                                                                   |
| PX-04    | Collaboration UI (W007)                                                                     |
| PX-05    | Reporting UI (W008)                                                                         |
| PX-06    | Productivity UI (W009)                                                                      |
| PX-07    | Administration UI (W010)                                                                    |

Granular rows below map into these Owner IDs.

---

## Phase 1 — Product Experience Completion

**Deliverable:** 100% feature-complete user experience per W002–W011.

### 1.1 Workspace & Cockpit — Owner **PX-01** (W002 / W011 S-01, S-07–S-10, S-21–S-24)

| ID    | Description                                                                                                                                    | Status                 | Dependency                      | Complexity | Acceptance criteria                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------- | ---------- | --------------------------------------------------------------------------- |
| PX-01 | Finish Operational Workspace fidelity: queue D4 ranking, exclusive user-scoped membership, show-more, keyboard j/k · 1/2/3, metric-band drills | **CLOSED**             | Ops APIs; P1 for live Approvals | L          | Owner accepted 2026-08-07                                                   |
| PX-02 | Mount real Enterprise Context on home (not stub copy); section order per W002                                                                  | Partial                | Enterprise Context service      | M          | Context rail composes for portfolio/org focus; SoR attributed; honest empty |
| PX-03 | Align workspace Confidence/Pulse with cockpit ops formula (no heuristic fork)                                                                  | Partial                | Operational compute engines     | M          | Overview/strip scores match cockpit “Why this score” for same project       |
| PX-04 | Cockpit History = project Operational Changes feed (`GET …/:id/changes`)                                                                       | Partial                | Changes API                     | M          | History intent shows meaningful events + why-care; not Control reuse        |
| PX-05 | Planning Timeline (roadmap-first; Gantt secondary)                                                                                             | None                   | Milestone/commitment/deps data  | L          | Planning intent shows Delivery Timeline per W002 D9; tasks under More…      |
| PX-06 | Close Project Wizard (S-10) with closure gates + Workflow outcomes                                                                             | **CLOSED** (via PX-01) | Lifecycle + P1                  | M          | Owner accepted with PX-01                                                   |
| PX-07 | Sidebar demotion (D18): primary = Workspace + Search; entity tools secondary                                                                   | Partial                | module.yaml                     | S          | My Work/Tasks/Backlog/Sprints/Roadmap not peer of Operational Workspace     |
| PX-08 | Secondary Tasks/Backlog/Sprints banner: Commitments remain operational SoR                                                                     | None                   | —                               | S          | Banner visible on S-23 routes                                               |
| PX-09 | Mobile Queue Shell (S-21)                                                                                                                      | **CLOSED** (via PX-01) | PX-01                           | L          | Owner accepted with PX-01                                                   |
| PX-10 | Universal Object Surface (S-08)                                                                                                                | **CLOSED** (via PX-01) | Cockpit chrome                  | L          | Owner accepted with PX-01                                                   |
| PX-11 | All Projects list columns: lifecycle · health · confidence · compliance · owner · programme                                                    | Partial                | List + ops projection           | M          | S-22 columns per W011; not product home                                     |
| PX-12 | Preferences: density · collapsed queue groups · default portfolio sort                                                                         | **CLOSED** (via PX-01) | Preferences service             | M          | Owner accepted with PX-01                                                   |

### 1.2 Portfolio (W005 / S-02–S-06)

| ID    | Description                                                                          | Status      | Dependency                    | Complexity | Acceptance criteria                                             |
| ----- | ------------------------------------------------------------------------------------ | ----------- | ----------------------------- | ---------- | --------------------------------------------------------------- |
| PX-20 | Portfolio Scorecard (S-02) — executive default, not KPI card grid                    | In progress | Portfolio projection API      | L          | Route `/portfolio` · drills to workspace                        |
| PX-21 | Portfolio Workspace (S-03) — Overview · Queue · hierarchy strips · Changes · Context | In progress | Roll-up API exists            | L          | Route `/portfolio/workspace` · hierarchy + queue                |
| PX-22 | Portfolio Timeline (S-04)                                                            | In progress | PX-05 patterns                | L          | Route `/portfolio/timeline` · commitment windows                |
| PX-23 | Initiative Cockpit (S-05) + Programme Cockpit (S-06) with five FocusNav intents      | None        | Hierarchy SoR / W005 entities | XL         | UI-D6; FocusNav at Initiative/Programme                         |
| PX-24 | Portfolio admin surfaces for hierarchy maintenance                                   | None        | P3 / admin                    | L          | Create/link Initiative·Programme·Project without Plane branding |

### 1.3 Resource & Team (W006 / S-15–S-16)

| ID    | Description                                                  | Status | Dependency              | Complexity | Acceptance criteria                                  |
| ----- | ------------------------------------------------------------ | ------ | ----------------------- | ---------- | ---------------------------------------------------- |
| PX-30 | Teams Directory (S-15)                                       | None   | Team APIs / Identity P2 | L          | Team · lead · count · Health · Capacity; create team |
| PX-31 | Team Surface (S-16) — members, assignments, skills, forecast | None   | PX-30 · P2              | L          | Header Health/Capacity; date-effective members       |
| PX-32 | Resource assignment & capacity views tied to commitments     | None   | PX-31 · ops             | L          | Assignments reference users/teams via pickers only   |

### 1.4 Collaboration (W007)

| ID    | Description                                                       | Status             | Dependency                | Complexity | Acceptance criteria                                                                |
| ----- | ----------------------------------------------------------------- | ------------------ | ------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| PX-40 | Continuity Case / meeting outcome overlays (O-09 · O-10)          | In progress        | Collaboration service     | L          | Meeting outcomes attach to operational objects; Continuity Case closed under PX-03 |
| PX-41 | Mentions / watch / activity via platform Attention (compose only) | In progress        | Notification Framework    | M          | Mentions publish events; Attention delivers                                        |
| PX-42 | Announcement / Notice editors (O-17) where W007 requires          | In progress        | Admin perms               | M          | API create paths in; editor polish remaining                                       |
| PX-43 | Object Discussion panel + unread indicators                       | In progress        | Collaboration + Attention | L          | Discussion panel wired on Object Surface                                           |
| PX-44 | Unified Communication Timeline on History/Object surfaces         | In progress        | PX-04                     | L          | Timeline composes operational + communication events                               |
| PX-45 | Control: Stakeholders · Responsibility Matrix · Escalation path   | **CLOSED** (PX-03) | Identity P2               | L          | Accepted with PX-03                                                                |

### 1.5 Reporting & Review (W008 / S-11–S-14) — Owner **PX-05 CLOSED**

| ID    | Description                                                | Status             | Dependency               | Complexity | Acceptance criteria       |
| ----- | ---------------------------------------------------------- | ------------------ | ------------------------ | ---------- | ------------------------- |
| PX-50 | Operational Review (S-11)                                  | **CLOSED** (PX-05) | Review pack model        | L          | Owner accepted 2026-08-07 |
| PX-51 | Review Calendar (S-12)                                     | **CLOSED** (PX-05) | PX-50                    | M          | Owner accepted with PX-05 |
| PX-52 | Reports Library + Viewer (S-13 · S-14) with How calculated | **CLOSED** (PX-05) | Reporting catalogue W008 | L          | Owner accepted with PX-05 |

### 1.6 Productivity & Search (W009 / S-20 · O-01–O-03 · O-11) — Owner **PX-06**

| ID    | Description                                        | Status      | Dependency           | Complexity | Acceptance criteria                           |
| ----- | -------------------------------------------------- | ----------- | -------------------- | ---------- | --------------------------------------------- |
| PX-60 | Search Results (S-20) with facets + explainability | In progress | Search providers     | M          | Facets; open in context; permission-filtered  |
| PX-61 | Command Palette Projects commands (O-01)           | In progress | Platform UCP         | M          | Actions · Go to · Create; permission-filtered |
| PX-62 | Shortcut Help (O-03) + W009 shortcut catalogue     | In progress | Productivity chrome  | S          | `?` shows Projects shortcuts                  |
| PX-63 | Productivity Session picker (O-11)                 | In progress | Productivity service | M          | Start/resume scoped sessions                  |

### 1.7 Administration (W010 / S-17–S-19) — Owner **PX-07 CLOSED**

| ID    | Description                                                                                                           | Status             | Dependency         | Complexity | Acceptance criteria                                                  |
| ----- | --------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------ | ---------- | -------------------------------------------------------------------- |
| PX-70 | Admin Dashboard (S-17) — Administration labels, not Scorecard                                                         | **CLOSED** (PX-07) | Admin APIs · P3    | L          | Owner accepted 2026-08-07                                            |
| PX-71 | Admin Registries (S-18) — Profiles · Policies · Roles · Delegations · Retention · Governed Search · Audit · Hierarchy | **CLOSED** (PX-07) | P3 + admin service | XL         | Owner accepted with PX-07                                            |
| PX-72 | Policy Simulation (S-19 / O-19)                                                                                       | None               | PX-71              | M          | Impact counts · conflicts · Confirm/Cancel                           |
| PX-73 | Standard overlays O-04–O-08 · O-12–O-16 as shared patterns                                                            | Partial            | UI library         | L          | No bespoke dialogs for waive/evidence/checkpoint/rebaseline/delegate |

### 1.8 UI System compliance (W011)

| ID    | Description                                                                                                     | Status                       | Dependency          | Complexity | Acceptance criteria                                          |
| ----- | --------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------- | ---------- | ------------------------------------------------------------ |
| PX-80 | Health · Confidence · Compliance co-display wherever Active+                                                    | Partial                      | Cockpit / strips    | M          | UI-D5 on strips + Pulse header                               |
| PX-81 | Purposeful empty states on every S-screen                                                                       | Partial                      | —                   | M          | UI-D10; no greeting chrome                                   |
| PX-82 | Extract W011 primitives (`MetricBand`, `OperationalStrip`, `Queue*`, `ObjectHeader`) into shared UI + Storybook | Partial (inline in apps/web) | Design System       | XL         | UI-D1; composites reusable across S-screens                  |
| PX-83 | Progressive disclosure + hierarchy 1–4                                                                          | Partial                      | —                   | M          | UI-D11 · UI-D12 spot-checked on S-01 · S-07 · S-02           |
| PX-84 | Projects top-bar chrome (Quick Action · Search · Palette) on every S-screen                                     | Partial                      | Shell               | M          | Consistent chrome; not page-local only                       |
| PX-85 | Sidebar IA: Portfolio · Reviews · Reports · Teams primary/More per W009; demote entity tools                    | Partial                      | module.yaml · PX-07 | M          | Nav matches Product Bible; no Plane-style primary entity nav |

**Phase 1 exit:** All PX-* Accepted or formally deferred by PO with written exception; no missing S-01–S-24 without PO waiver.

---

## Phase 2 — Production Readiness

**Deliverable:** No production blockers remain (P1–P5).

| ID    | Description                                                                                                                                                    | Status     | Dependency                      | Complexity | Acceptance criteria                                       |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------- | ---------- | --------------------------------------------------------- |
| PR-01 | **P1 Workflow Bridge complete** — Postgres binding store · HTTP request/list/apply/sync · production executor · queue Approval rows · cert-env waiver lockdown | **CLOSED** | Workflow platform               | L          | Owner accepted 2026-08-07                                 |
| PR-02 | **P2 Enterprise Identity Pickers** — User · Team · Role validation everywhere ownership is set                                                                 | **CLOSED** | Identity / BetterAuth directory | L          | Owner accepted                                            |
| PR-03 | **P3 Organisation Governance Administration** — enterprise Governance Profile CRUD + publish                                                                   | **CLOSED** | Owner accepted                  | L          | Simulation · compliance · admin dashboard accepted        |
| PR-04 | **P4 Migration Verification** — apply/verify `0109`–`0130` on all supported envs                                                                               | **CLOSED** | Ops access                      | M          | All env targets PASS 2026-08-07                           |
| PR-05 | **P5 Certification pipeline prepared** — unit · integration · API · UI · a11y · perf · migration · E2E harness green for Projects                              | Partial    | PR-01–04 · Phase 1              | L          | Checklist in CERTIFICATION-PIPELINE.md all runnable in CI |

**Phase 2 exit:** P1–P5 closed; PRODUCTION-READINESS board shows no Blocking items.

---

## Phase 3 — Hardening & Certification

**Deliverable:** Release Candidate — zero Critical / High open defects.

| ID    | Description                                                                        | Status      | Dependency        | Complexity | Acceptance criteria                     |
| ----- | ---------------------------------------------------------------------------------- | ----------- | ----------------- | ---------- | --------------------------------------- |
| HD-01 | End-to-end journeys: Initiate → Deliver → Hold/Resume → Close · Queue act · Search | Not started | Phase 1–2         | L          | Playwright suite covers W011 §21 matrix |
| HD-02 | Performance: workspace portfolio p95; cockpit load; no N+1 home assembler          | Partial     | Batch projections | M          | Meet W002 targets locally/CI budgets    |
| HD-03 | Accessibility certification WCAG AA on S-01 · S-07 · S-02 · S-09 · S-20            | Not started | PX polish         | M          | Automated + sample manual a11y pass     |
| HD-04 | Security review: authz on all Projects APIs; no secret leakage; SoD on waivers     | Not started | PR-01–03          | M          | Review recorded; Critical/High fixed    |
| HD-05 | UX polish + defect burn-down to zero Critical/High                                 | Not started | HD-01–04          | L          | Defect board empty at C/H; RC tagged    |

**Phase 3 exit:** RC build; certification evidence pack draft started.

---

## Phase 4 — Release

**Deliverable:** Tagged **APZ Projects Release 3.0** · status **PRODUCTION READY** · frozen except defects.

| ID    | Description                                                        | Status      | Dependency    | Complexity | Acceptance criteria                          |
| ----- | ------------------------------------------------------------------ | ----------- | ------------- | ---------- | -------------------------------------------- |
| RL-01 | Release Notes                                                      | Not started | Phase 3       | S          | User-visible changes; known limitations      |
| RL-02 | Operational Guide (ops/runbook)                                    | Not started | Phase 2–3     | M          | Health, queues, migrations, Workflow degrade |
| RL-03 | Administrator Guide                                                | Not started | P3 · admin UI | M          | Profiles, policies, roles, templates         |
| RL-04 | User Guide                                                         | Not started | Phase 1       | M          | Workspace · Cockpit · Queue · Portfolio      |
| RL-05 | Deployment Guide                                                   | Not started | P4            | M          | Compose/env/migrate/certify steps            |
| RL-06 | Certification Evidence pack                                        | Not started | Phase 3       | M          | Suites, results, sign-off                    |
| RL-07 | Tag `apz-projects-release-3.0` · declare Production Ready · freeze | Not started | RL-01–06      | S          | Tag on main; Owner declaration recorded      |

**Phase 4 exit:** Release frozen; engineering may start next APZHUB product.

---

## Execution order (recommended)

1. **Finish blockers that unblock UX:** PR-01 (P1) in parallel with PX-01–PX-07
2. **Complete S-01 / S-07 fidelity** before greenfield Portfolio/Teams screens
3. **PX-20–PX-24 Portfolio** then Resource · Collaboration · Reporting · Productivity · Admin
4. **PR-02 · PR-03** as Admin/Teams need identity + governance
5. **PR-04 · PR-05** continuously — do not wait for feature freeze
6. **Phase 3** only when Phase 1–2 exit criteria met (or PO-approved exceptions)
7. **Phase 4** then stop — no context switch mid-closeout

---

## Reporting

Report only:

- Phase 1 — Completed / In Progress / Remaining
- Phase 2 — Completed / Blocking / Remaining
- Phase 3 — Completed / In Progress / Remaining
- Phase 4 — Completed / Remaining

Do not invent new programmes. Raise Product Bible conflicts to the Product Owner.
