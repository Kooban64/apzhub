# APZQEP REDESIGN — PHASE 0 REPOSITORY RECONCILIATION

Presentation authority: [APZQEP-UX-AUTHORITY.md](./APZQEP-UX-AUTHORITY.md).  
Classification: **A** suitable domain · **B** exists but needs adaptation · **C** genuinely absent · **D** presentation must be replaced.

Inspected: `apps/web` QEP routes/views/APIs, `packages/qep-*`, `packages/platform-services` QEP façade, `packages/platform-authorization`, `packages/config/src/db/qep-*`, `integrations/{github-actions,gitlab-ci,qep-github}`, Shared Source (`apps/web/lib/source`), workbench rail/sidebar.

---

## 1. Existing QEP routes

Workbench entry: `/workspace/qep` → `/workspace/qep/home`. Router: `apps/web/components/qep/qep-workspace-router.tsx`.

**Durable presentation packages (`packages/qep-*/presentation`):**

| Path                                                            | Domain                    |
| --------------------------------------------------------------- | ------------------------- |
| `/workspace/qep/requirements` (+ baselines, relationships)      | Requirements              |
| `/workspace/qep/traceability` (+ trace-links, matrix, taxonomy) | Traceability              |
| `/workspace/qep/verification`                                   | Verification artefacts    |
| `/workspace/qep/test-specifications`                            | Test specifications       |
| `/workspace/qep/test-plans`                                     | Test plans                |
| `/workspace/qep/test-execution`                                 | Governed executions       |
| `/workspace/qep/suites`                                         | Suites                    |
| `/workspace/qep/execution-plans`                                | Execution plans (handoff) |
| `/workspace/qep/execution-workspace`                            | Execution sessions        |
| `/workspace/qep/defects`                                        | Defects                   |
| `/workspace/qep/enterprise-requirements` (+ matrix, coverage)   | Cap E derived coverage    |
| `/workspace/qep/enterprise-reporting`                           | Reporting                 |
| `/workspace/qep/evidence`                                       | Evidence                  |
| `/workspace/qep/automation`                                     | Automation                |
| `/workspace/qep/scm`                                            | SCM / change events       |
| `/workspace/qep/quality-intelligence`                           | QI                        |
| `/workspace/qep/dashboards`                                     | Dashboards                |

**App-composed routes (`apps/web/lib/qep/*routes*`):**

`/home`, `/my-work`, `/portfolio`, `/release-readiness`, `/certification`, `/rc`, `/quality-flows`, `/pr-quality`, `/quality-graph`, `/domains`, `/quality-journey`, `/early-check`, `/integrations`, `/ai-workspace`, `/mcp-dx`, `/search`, `/learning`, `/administration`, `/risk`, `/audit`, `/reporting`, `/execution` (alias of test-execution), `/verification-design`, `/verification-library` (alias of suites).

**Source (independently permissioned):** `/workspace/source` — not under `/workspace/qep`.

**Current Quality sidebar (what users actually see):** Overview, Applications (= portfolio), Test Library, Test Plans, Runs, Defects, Automation, Evidence, Releases, Source (if `source.read`). **D** — flattened; not the master IA.

---

## 2. Existing domain capabilities

First-class PostgreSQL-backed packages (schemas under `packages/config/src/db/qep-*.ts` plus domain packages):

Requirements, requirement relationships/baselines, verification, test specifications, test plans, test execution, suites, execution plans, execution workspace, defects, evidence, traceability, automation, SCM, quality intelligence, dashboards, reporting, requirements-traceability (Cap E).

App runtimes / file ledgers (not Cap SoR): quality projects (portfolio), risk register (`risks.json`), continuous-cert signals, QA-gate confirms, knowledge, MCP proposals, some orchestration overlays.

Platform: BetterAuth, PermissionService, entitlements (`productKey: qep`), search (`@apzhub/search-qep`), notifications/activity frameworks, Shared Source workspace.

---

## 3. Existing APIs/read models

Client API prefix: `/api/v1/qep/**` (~260 route files). Auth: `withPlatformApiAuth` → `getPlatformServiceGateway()` or domain runtimes.

Read families that exist:

- Requirements, baselines, relationships, search, versions, lifecycle
- Specifications (CRUD + review/approve/reject/retire/supersede/history)
- Plans (items, schedule, assignment, clone, progress)
- Executions (assigned, review-queue, steps, history, manifest, evidence-references)
- Execution plans + sessions (steps, evidence, amend, lifecycle, handoff)
- Suites (tree, clone, move, lifecycle)
- Defects (history, relationships, evidence, assign)
- Evidence (content, provenance, collections, sets, access grants, verify, audit)
- Trace links (taxonomy, validate, supersede, history, by endpoint)
- Enterprise requirements matrix + coverage snapshots
- Certification evaluations
- Quality flows (command-centre payload today)
- Portfolio projects
- Automation executions/providers/mappings/ci-ingest
- SCM repositories/changes/providers/webhooks/impact
- QI scores/signals/recommendations/history
- Dashboards, enterprise reporting
- Integrations, audit, risk, security-assurance bridge
- Search via platform search, not a parallel QEP search SoR

Envelope: `{ data|error, meta: { requestId, correlationId } }`.

---

## 4. Existing write paths

Writes exist for the Cap domains above (create/update/lifecycle/approve/reject/clone/handoff/execute/ingest). Representative:

- `POST /api/v1/qep/requirements`, lifecycle, baselines, relationships
- `POST /api/v1/qep/specifications` + review/approve/reject/retire/supersede
- `POST /api/v1/qep/plans` + items, approve, execute, clone
- `POST /api/v1/qep/executions` + steps, actions, ingestions, observations
- `POST /api/v1/qep/execution-sessions/.../steps|evidence|lifecycle|amend`
- `POST /api/v1/qep/suites`, defects (including `from-execution`), evidence
- `POST /api/v1/qep/traceability/trace-links`
- Certification `.../decision`
- SCM connect/sync/webhooks; automation mappings/ci-ingest
- Portfolio project create/update
- Risk create/status (file ledger)

**Do not add** `qep-v2-backend`, mock SoR, or UI-only JSON as authoritative writes.

---

## 5. Existing AuthZ / QEP roles / scopes

Permissions: `packages/platform-authorization/src/qep-core-qe-permissions.ts` (Cap A–F catalogue + `qep.*`).

Durable roles today: **QEP Operator**, **QEP Reader**, **QEP Engineer** (`product-qep-engineer`). See [APZQEP-ROLE-MATRIX.md](./APZQEP-ROLE-MATRIX.md).

Specified nine product roles **do not exist**. Role is currently permission-grant, not UX composition.

Scopes: `qep.application:`, `qep.project:`, `qep.repository:`. Source: `source.read` / `source.write` independent of QEP entitlement. **Operator currently includes `source.write`** — must not be treated as QEP Master implying Source write.

Enforcement: handler `requireQepPermission` + domain `requirePermission`. UI hiding is not AuthZ.

**Class:** AuthZ machinery **A**. Specified role catalogue **C** (composition in Phase 1; durable roles Phase 8).

---

## 6. Existing application + release context

| Concept                                    | Truth                                                                                                                                                                                                                                                        | Class                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Application (first-class quality boundary) | Sidebar label “Applications” → `/workspace/qep/portfolio`. Quality projects are a **file ledger** (`quality-project-store.ts`). Suite/requirement `application?: string` is a label. Scope prefix `qep.application:` exists without an Application aggregate | **B** / **C** for a durable Application entity |
| Release object                             | No QEP Release aggregate. Strings: `releaseReference`, plan type `"release"`, certification RC face                                                                                                                                                          | **C**                                          |
| Environment                                | `EnvironmentReference { referenceId, label }` on execution plans — not an Environment SoR                                                                                                                                                                    | **C**                                          |
| Header selectors                           | Workbench header is `APZ │ {tenant} │ Search APZ...` — no APZQEP / Application / Release selectors                                                                                                                                                           | **D**                                          |

Phase 1 must only render selectors backed by facts (portfolio/project if used as application context; omit Release until a durable object exists).

---

## 7. Requirements / stories / acceptance criteria capability

**Requirements — A (domain) + D (UI).** Entity: key, title, description, type (`business | functional | non_functional | security | compliance | acceptance`), status, priority, owner, approval, version, `projectId`, optional AC list. APIs + baselines + relationships. Types do **not** include `story`.

**User Stories — C.** No UserStory entity, table, or API. Testing-stack work-item kind `"story"` is not QEP SoR.

**Acceptance criteria — B/C.** Value object `{ items: readonly string[] }` on Requirement (`acceptance-criteria.ts`), persisted as `acceptance_criteria_json`. **No AC-01 identifiers. No AC→test trace endpoint.** Trace kinds include `requirement` and `test_specification` / `test_case`, not AC items.

Material domain extension (addressable AC + stories) is **Phase 2**, not Phase 1. Recorded as GAP.

---

## 8. Test cases / suites / plans / runs capability

| Object             | Truth                                                                                                   | Class                 |
| ------------------ | ------------------------------------------------------------------------------------------------------- | --------------------- |
| Test specification | First-class; types/lifecycle/owner/preconditions/AC strings. **No first-class steps (action/expected)** | **B** vs “Test Case”  |
| Test case          | Endpoint kind / future ref. Suites package: _“Test Cases are out of scope”_                             | **C** as distinct SoR |
| Suite              | First-class hierarchy, lifecycle, clone/move                                                            | **A** + **D**         |
| Test plan          | First-class strategy/plan (scope, items, schedule, assignment, execute)                                 | **A** + **D**         |
| Execution plan     | Cap B readiness/handoff — **not** a run                                                                 | **A** (keep distinct) |
| Run                | `qep-test-execution` aggregate **and** `qep-execution-workspace` sessions                               | **B** dual model      |

---

## 9. Manual execution capability

**A (domain) + D (canvas).**

`qep-test-execution` steps: `instruction`, `expectedResult`, `actualResult`, outcomes `passed | failed | blocked | skipped | not_applicable | inconclusive | not_executed | cancelled`, evidence ids.

`qep-execution-workspace`: session lifecycle + step outcomes `pass | fail | block | skip | …`, evidence attach.

UI: list + outcome buttons (`qep-execution-workspace-views`, `qep-test-execution-views`). **Not** the signature three-pane execution canvas (run list | current step | context + bottom evidence).

Two parallel execution models will need UX reconciliation in Phase 4 without inventing a third store.

---

## 10. Exploratory testing capability

**C.** Only orchestration activity kind `exploratory_testing`. No session/charter/notes/duration entity.

Do not fake session management. Phase 4 classified this as **out of scripted execution**. Phase 5 Screens 1–4 visuals are **LOCKED**. Domain lock **RECORDED**. Exploratory Session is a **NEW** aggregate. Implementation **COMPLETE** — [report](./APZQEP-PHASE-5-REPORT.md).

---

## 11. UI/UX verification capability

**C.** Spec types `usability | accessibility | mobile | web | desktop` are classification enums. `/workspace/qep/quality-journey` is a **change workflow**, not UI/UX verification (journey/viewport/device/check).

Phase 4 did not invent a UI/UX verification product. Phase 5 Screens 3–4 visuals are **LOCKED**. Domain lock **RECORDED**. Experience Plan is a **NEW lightweight aggregate** (not Test Plan). UI/UX Verification Activity is a **NEW** workflow root. Implementation **CLOSED · ACCEPTED** — [acceptance](./APZQEP-PHASE-5-ACCEPTANCE.md).

---

## 12. Automation capability

**A + D.** `packages/qep-automation`: assets, mappings, executions, CI ingest, providers. Integrations: GitHub Actions / GitLab CI as pipeline adapters; Playwright health exists. Provider names already leak in some admin/automation views — keep only where technically relevant.

---

## 13. Evidence capability

**A + D.** First-class evidence with provenance events, collections, seal/hash, access grants, classify/review/hold/archive. Attach from execution and defects. Integrity fields exist. Presentation is page-shell tables, not inspector/first-class provenance UX.

---

## 14. Defect / retest capability

**A + D** (lifecycle vocabulary **B**).

States: `new | triaged | assigned | in_progress | fixed | ready_for_retest | verified | rejected | duplicate | wont_fix | closed | archived`.

Severity: `critical | major | minor | trivial` (authority example uses High/Medium/Low — **map, do not invent a parallel enum**).

Retest: state `ready_for_retest` + transitions; no separate Retest entity. Raise-from-execution exists. Relationships include `release` / `environment` as **string targets**, not entities.

---

## 15. Traceability / coverage capability

**Traceability — A + D.** Endpoint kinds include requirement, test_specification, test_case, test_execution, evidence, defect, verification, certification_artefact. Matrix UI `/workspace/qep/traceability/matrix` + Cap E `GET .../enterprise-requirements/matrix`.

**Coverage — B.** Derived `CoverageSnapshot` (Cap E); not a dedicated coverage engine. Traceability domain explicitly excludes coverage-engine concerns. No justified overall “quality coverage %”.

Story/AC granularity in the specified matrix is **C** until AC/story objects exist.

---

## 16. Quality risk capability

**B (weak).** File ledger `apps/web/lib/qep/risk-store.ts` — manual items `open | mitigated | accepted | waived`. **Not** an aggregation of blocking defects, unverified criteria, failed tests, missing evidence, gate failures. No `packages/qep-risk`. Permission keys `qep.risk.read` / `operate` exist.

Authority wants explainable aggregated concerns. Phase 6 Screen 1 — Quality Risk is **LOCKED** ([lock](./APZQEP-PHASE-6-SCREEN-1-QUALITY-RISK.md)). **Quality signal ≠ Quality Risk.** Do not show invented RAG scores. Do not replace the file ledger or implement a new Risk SoR until authorised after Screens 1–4 + reconciliation.

---

## 17. Release readiness / gates / certification capability

| Surface                  | Truth                                                                                                                                                                   | Class                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Release readiness module | `/workspace/qep/release-readiness` — no domain package. Home Command Centre is **Quality Flow KPI counts**                                                              | **B** + **D**                                     |
| Gates                    | Platform orchestration advisory READY/BLOCKED; QA-gate file packs; CI evidence refs in certification                                                                    | **B** — not explicit quality-condition gate table |
| Certification            | Evaluations + human GO/NO_GO (`certification-runtime.ts`). Permissions `qep.certification.read` / `decide`. States are not the specified DRAFT→ISSUED→REVOKED catalogue | **B**                                             |
| Release evidence pack    | Evidence sets + report-pack helpers                                                                                                                                     | **B**                                             |

Phase 6 visual design **COMPLETE**. Domain reconciliation **ACCEPTED**. Domain lock **RECORDED**. Inventory **DRAFTED** ([inventory](./APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md)). Implementation **NOT AUTHORISED**. Release aggregate **not required**. Readiness score **rejected**.

---

## 18. Build / CI capability

**B.** QEP SCM change events + testing pipeline adapters (`integrations/github-actions`, `gitlab-ci`) + automation `ci-ingest`. Not a QEP “Builds & CI” workbench answering build/commit/branch/pipeline/verification/release/evidence as one surface. Do not clone GitHub Actions.

---

## 19. Source Workspace capability

**A (read) + D (QEP-related quality pane).** Shared Source at `/workspace/source`. `SOURCE_SLICE3_READ_CONTEXT_ONLY = true` — write UI off even if `source.write` / `qep.scm.operate`. Independent permissions already. Related-quality cross-links only where relationships exist.

**Do not enable write/commit/PR/merge/shell/Terminal in this redesign.**

---

## 20. Existing QEP Administration capability

**B + D.** `/workspace/qep/administration` is an entitlement/provider hub that **deep-links Org members, subscriptions, Ops sessions**. Explicitly does not own IAM. No QEP People & Access table, Teams-to-application bindings, Environments SoR, or Release Policies SoR.

Integrations centre exists. Audit route exists (`/workspace/qep/audit`, `GET /api/v1/qep/audit`) — do not fabricate history.

---

## 21. Existing responsive/mobile capability

**C for QEP product mobile.** Workbench has a generic `mobileNav` slot. No Tester bottom nav, no mobile execution workflow. Spec type `"mobile"` is classification only. Marketing pages for mobile testing are unrelated.

---

## 22. Existing UI components worth retaining

Retain as **building blocks**, not as page composition:

- `@apzhub/ui` tokens, tables, buttons, shell geometry (`WorkbenchShellLayout`, `DesktopShell`)
- Shared Source editor (Monaco) for Phase 5
- `QepLoadingState` / `QepErrorState` honesty patterns (rewrite chrome)
- Platform search trigger, notifications, tenant switcher, command palette infrastructure
- Permission filtering adapters, product entitlement soft-gate
- Data fetching clients in `apps/web/lib/qep/*-api.ts` (extend, don’t replace)

Do **not** retain `QepPageShell` dashboard/card layouts, KPI Metric tiles on Home, flattened sidebar, or module-catalogue sprawl as the product IA.

---

## 23. Existing APZQEP presentation that must be replaced

**D — replace, do not wrap:**

- Flattened Quality sidebar (`compose-qep-sidebars.ts`)
- Home Command Centre Quality Flow metrics + security KPI cards (`qep-home-views.tsx`)
- My Work as static queue links (`qep-my-work-view.tsx`)
- Per-module `QepPageShell` list/detail pages (requirements, specs, plans, execution, defects, evidence, …)
- Catalogue aliases and extra IA (quality-flows, quality-journey, early-check, domains, pr-quality, quality-graph, dashboards-as-home, AI workspace) as **primary** navigation
- Header “Search APZ” while in QEP (should be Search QEP context without a new search engine)
- Generic workbench rail labelling “Quality” vs product “APZQEP”

---

## 24. Genuine capability gaps

| Gap                                                               | Type                                  | Phase impact                                                                                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nine APZQEP product roles                                         | permission / UX composition           | Phase 1 compose Master; Phase 8 durable roles                                                                                                                                    |
| Application aggregate                                             | domain-model (portfolio ledger today) | Phase 1 bind to existing project/portfolio facts only                                                                                                                            |
| Release aggregate                                                 | domain-model                          | **Not required for Phase 6** (pending Owner). Recommend Application + Environment + SCM/version identity. Do not create `qep_release`                                            |
| Aggregated quality risk from facts                                | read-model                            | Phase 6 Screen 1 **LOCKED**. File ledger **cannot** be SoR — NEW durable Risk recommended ([report](./APZQEP-PHASE-6-DOMAIN-RECONCILIATION-REPORT.md))                           |
| Explicit quality gates + certification state machine as specified | domain / mapping                      | Screen 3–4 **LOCKED**. Gates: **NEW** QEP bounded conditions. Certification: **EXTEND** F4 GO/NO_GO. TCMS certification_record **not** APZQEP SoR. Implementation not authorised |
| User Story entity                                                 | domain-model                          | Phase 2 — Owner if extending                                                                                                                                                     |
| Addressable AC (AC-01) + AC traces                                | domain-model                          | Phase 2 — Owner if extending                                                                                                                                                     |
| Test Case SoR distinct from specification; spec steps             | domain / read-model                   | Phase 3                                                                                                                                                                          |
| Signature execution canvas + mobile execution                     | UI                                    | Phase 4 (domain steps **A**)                                                                                                                                                     |
| Exploratory session                                               | domain-model                          | Phase 5: **NEW** session aggregate; shared Observation/Issue/Note; implementation **CLOSED · ACCEPTED**                                                                          |
| UI/UX verification discipline                                     | domain-model                          | Phase 5: **NEW** lightweight experience-plan + activity (not a second Test Plan / TE); implementation **CLOSED · ACCEPTED**                                                      |
| Builds & CI composed surface                                      | read-model / UI                       | Deferred (not Phase 6 under Owner 2026-08-20 resequence)                                                                                                                         |
| Environments / release policies                                   | domain-model                          | Phase 9                                                                                                                                                                          |
| QEP People & Access as product UX on existing IAM                 | UI on IAM                             | Phase 9                                                                                                                                                                          |
| Dual execution models                                             | architecture                          | Phase 4 mapping, not a third store                                                                                                                                               |

---

## 25. Data migration implications

**None for Phase 1.** Presentation replacement over existing APIs.

Later: if Stories/AC become first-class, migrate `acceptance_criteria_json` strings into addressable rows (additive). Do not dual-write a new quality store. File ledgers (risk, quality projects) stay non-authoritative until promoted through existing architecture — not this phase.

---

## 26. Regression risks

- Certified Cap A–F APIs, evidence integrity, tenant RLS, permission keys
- Source permission independence (`SOURCE_SLICE3_READ_CONTEXT_ONLY`)
- Soft product entitlement gate (`useSoftProductAccess("qep")`) — standalone QEP must keep working without PRD/PEN
- Defect/execution/plan lifecycles
- Playwright workbench QEP/source specs
- Operator `source.write` accidentally exposed as Master capability
- Wrapping old routes under new nav without replacing composition (definition of not-done)

---

## 27. Proposed Phase 1 file/route impact

No code in Phase 0. Proposed **when authorised**:

| Area                                         | Likely files                                                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Master IA sidebar                            | `apps/web/lib/workbench/compose-qep-sidebars.ts` (+ tests)                                                                                  |
| Rail product label / standalone hide PRD/PEN | `compose-workbench-rail.ts` (QEP slice only)                                                                                                |
| Router landings                              | `qep-workspace-router.tsx` — Home + My Work first; **do not delete** other routes                                                           |
| Command Centre                               | replace `qep-home-views.tsx` composition; keep `/api/v1/qep/quality-flows` as **one** fact source among others                              |
| My Work                                      | replace `qep-my-work-view.tsx` to bind assigned executions/defects APIs                                                                     |
| Header context                               | QEP-only chrome in workbench header path (`workbench-page.tsx` / header) — Application from portfolio/project if available; no fake Release |
| Responsive                                   | shell regions; no mobile Tester IA yet (Phase 4/8)                                                                                          |
| Evidence                                     | `docs/frontend/apzqep-redesign/evidence/phase-1/`                                                                                           |

Unchanged: all `/api/v1/qep/**` contracts unless a tiny read-model is required for Command Centre facts (prefer composing existing list endpoints).

---

## 28. Phase 1 implementation inventory

When Owner accepts Phase 0:

1. APZQEP shell using existing DEF regions (hide empty inspector/bottom)
2. QEP Master navigation = master IA, permission-filtered, section hierarchy
3. Application context selector only if portfolio/project facts exist
4. Quality Command Centre: attention / blocking / my work / recent activity from **real** APIs (honest empty/unknown)
5. My Work: assigned execution + defect (+ review if API supports actor filter)
6. Responsive desktop/laptop/tablet collapse; not Tester mobile execution
7. Light + dark via tokens
8. Screenshots + route/permission tests

**Out of Phase 1:** Stories, AC objects, test case editor, execution canvas, mobile Tester, Source write, AI, new backends, nine durable IAM roles, PEN/PRD/platform redesign.

---

## 29. Owner decisions required before Phase 1

**OWNER DECISIONS REQUIRED BEFORE PHASE 1: NONE**

Phase 1 can proceed on existing APIs and permission composition. Material domain gaps (Stories, addressable AC, exploratory, UI/UX verification, Release/Environment aggregates, nine durable product roles) are **later-phase** returns, not Phase 1 gates.

Noted (not blocking): QEP Operator includes `source.write` — Phase 1 Master UX must not imply Source write; independent `source.*` remains the control.

---

## 30. Recommendation

**Proceed to Phase 1 after Owner acceptance.** Repository has a substantial QEP domain and API surface. The current UI is a module catalogue + Quality Flow dashboard, not the specified product. Replace presentation; do not wrap it. Do not start a second QEP.

```text
PHASE 0 STATUS:
READY FOR OWNER REVIEW

IMPLEMENTATION:
NOT STARTED
```
