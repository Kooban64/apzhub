# APZQEP Phase 5 — domain reconciliation report

**Status:** ACCEPTED  
**Date:** 2026-08-20  
**Domain lock:** [APZQEP-PHASE-5-DOMAIN-LOCK.md](./APZQEP-PHASE-5-DOMAIN-LOCK.md)  
**Implementation:** NOT AUTHORISED  
**Agenda:** [APZQEP-PHASE-5-DOMAIN-RECONCILIATION.md](./APZQEP-PHASE-5-DOMAIN-RECONCILIATION.md)

No schemas, migrations, tables, APIs, UI, seed, SSH, Terminal, Source write, Release, AI, pixel-diff, BrowserStack, device farm, Figma, or Playwright visual comparison were changed. Phase 6 was not started.

Locked visuals remain: [Screen 1](./APZQEP-PHASE-5-SCREEN-1-EXPLORATORY-SESSIONS.md) · [Screen 2](./APZQEP-PHASE-5-SCREEN-2-EXPLORATORY-SESSION-WORKSPACE.md) · [Screen 3](./APZQEP-PHASE-5-SCREEN-3-UI-UX-VERIFICATION-PLANS.md) · [Screen 4](./APZQEP-PHASE-5-SCREEN-4-UI-UX-VERIFICATION-WORKSPACE.md).

This report proves what is **genuinely new**. Hypothesis from Owner: Observation / Issue / Note may become shared quality-capture primitives; Exploratory and UI/UX remain distinct workflows; Evidence, Defect, Application, Environment remain existing authorities. **The repository supports that hypothesis.**

---

## Owner return block

```text
PHASE 5 DOMAIN RECONCILIATION:
COMPLETE

EXPLORATORY SESSION:
NEW

EXPLORATORY CHARTER:
EXTEND

OBSERVATION:
NEW

ISSUE:
NEW

NOTE:
NEW

UI/UX VERIFICATION PLAN:
NEW

UI/UX VERIFICATION ACTIVITY:
NEW

UI/UX CRITERION:
NEW

CRITERION RESULT:
NEW

VERIFICATION DISCIPLINE:
EXTEND

EXPERIENCE CONTEXT:
NEW

VIEWPORT MATRIX:
DERIVED

PROGRESS:
DERIVED

LIFECYCLE:
EXTEND

ACTIVITY / HISTORY:
EXTEND

EVIDENCE:
EXTEND

DEFECT:
EXTEND

APPLICATION:
REUSE

ENVIRONMENT:
EXTEND

TRACEABILITY:
EXTEND

AUTHZ:
EXTEND

TENANT ISOLATION:
PASS

APPLICATION ISOLATION:
PASS

SOURCE INDEPENDENCE:
PASS
```

**NEW** here means a **minimum additive object**, not a parallel Test Plan engine, not a third execution engine, and not clones of Evidence or Defect.

---

## Architectural conclusion (read this first)

| Layer                                         | Decision                                                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Customer workflows                            | Two distinct: Exploratory (charter-driven) and UI/UX Verification (plan-driven)                                      |
| Shared capture                                | One Observation / Issue / Note model used by both workflows                                                          |
| Evidence / Defect / Application / Environment | Existing SoRs. Extend relationships and snapshots only                                                               |
| Scripted Test Case execution                  | Untouched. `qep-test-execution` and `qep-execution-workspace` stay Phase 3–4                                         |
| UI/UX Plan                                    | New **lightweight experience-plan** aggregate. Not option A (criteria as Test Cases). Not a cloned Test Plan package |
| Live work                                     | New Exploratory Session + new UI/UX Verification activity. Not TE. Not workspace session                             |
| Derived                                       | Viewport Matrix, progress counts. No score tables                                                                    |

Do **not** create: `qep_execution`, a second Evidence store, a second Defect store, a Viewport Matrix table, UX/Accessibility/Quality scores, or a duplicate Test Plan approval engine.

---

## 1. Repository evidence for every decision

### Exploratory Session — NEW

Compared and rejected:

| Candidate                                                   | Why it cannot be the Session SoR                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@apzhub/qep-test-execution` / `qep_test_execution`         | Requires specification/source resolution, step manifest, step outcomes `passed\|failed\|…`, execution outcome. Completing a TE is a quality result. Completing an Exploratory Session is only “activity ended”. Observations exist but are **children of an execution** (`qep_test_execution_observation.execution_id` ON DELETE CASCADE). |
| `@apzhub/qep-execution-workspace` / `qep_execution_session` | Suite/session orchestration from execution-plan handoff. `PlanningSnapshot` requires `suiteId` / `suiteVersion`. Steps have pass/fail outcomes. Not a charter.                                                                                                                                                                             |
| Test Plan (`qep_test_plans`)                                | Planning envelope for specification membership. A session is live work, not a plan.                                                                                                                                                                                                                                                        |
| `@apzhub/qep-verification`                                  | Requirement/artefact **verification decision** engine (`verified\|failed\|waived` against a subject). Not a tester session. Trace kind `verification_activity` belongs to this engine. Do not overload.                                                                                                                                    |
| Orchestration `activityKind: "exploratory_testing"`         | Policy-selection catalogue only (`packages/platform-orchestration/src/contracts/policy-selection.ts`). No session/charter/duration entity. Confirms Phase 0 gap **C**.                                                                                                                                                                     |

**Rationale:** Charter-driven discovery is not predefined Test Case execution and not Suite execution. Reuse would distort Phase 3–4. A new Exploratory Session aggregate is required.

### Exploratory Charter — EXTEND (of the Session)

No separate Charter SoR exists. Test Plan `objective` / `scopeClass` are plan fields, not a discovery mission. Test Case steps have expected results; **Areas to Explore must not become steps**.

Store Mission / Objective / Scope / Areas as **fields (and area list) on the Exploratory Session**. Areas = prompts with explored/not-explored for progress derivation. Not Test Cases.

### Observation — NEW (shared quality-capture)

Existing “observation” words do **not** match product Observation:

| Existing                                                       | Actual meaning                                                                                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qep_test_execution_observation`                               | Note on a Test Execution. Bound to TE. Cannot serve Exploratory or UI/UX without a TE parent.                                                       |
| `qep_qi_observation` / `@apzhub/platform-quality-intelligence` | Immutable **telemetry** from automation/SCM/ops (`ObservationSource`: automation, scm, execution, …). Not a tester noticing something in a session. |
| Evidence classification `"observation"`                        | Content class of an Evidence item (`packages/qep-evidence/src/domain/evidence/constants.ts`). Not a first-class Observation.                        |

**Rationale:** First-class Observation ≠ Defect ≠ Failure ≠ Test Case result ≠ QI signal ≠ Evidence class. One shared Observation object should serve **both** Exploratory and UI/UX, attached by relationship (`subjectKind` + `subjectId`). Do not reuse TE observation rows as the product Observation SoR. Leave TE observations as scripted-execution notes.

### Issue — NEW (shared quality-capture)

No intermediate quality-issue aggregate exists.

| Existing                          | Actual meaning                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `@apzhub/qep-defects` / Defect    | Investigation SoR with lifecycle `new → … → closed`. Explicitly “Not evidence. Not execution facts.” |
| Execution-plan `ReadinessFinding` | Plan-readiness diagnostics, not tester-elevated concerns.                                            |
| Defect keywords include “finding” | Search synonym, not a domain type.                                                                   |

**Rationale:** Observation ≠ Issue ≠ Defect. Issue is an elevated concern that may be dismissed, resolved, linked to an existing Defect, or promoted into a new Defect. Same Issue object for both workflows. **No second Defect store.**

Issue → Defect (deliberate only):

1. `dismiss` / `resolve` on Issue (Issue lifecycle, not Defect).
2. `link` → Defect relationship kind toward existing Defect.
3. `promote` → create Defect via existing Defect API with copied context; store `defectId` on Issue.  
   No auto-create on ingest or capture.

### Note — NEW (shared, lightweight)

Existing notes are incidental: Test Plan item `notes`, Evidence attach `note`, Defect evidence `note`. Specification relationship kind `"note"` is spec metadata.

Product Note must stay distinct from Observation / Issue / Defect / Evidence. A small shared note object (session/verification-scoped) is the minimum. Do not store Notes as Observations or audit events.

### UI/UX Verification Plan — NEW (lightweight; not a second Test Plan **system**)

Compared against Phase 3 Test Plan:

| Test Plan fact                                                                                          | UI/UX Plan need                                                                                                                |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `PLAN_TYPES`: release, product, feature, milestone, sprint, regression, certification, custom           | Experience verification across devices/viewports/disciplines                                                                   |
| Items **require** `specificationId` (`createTestPlanItem`)                                              | Membership is criteria + experience contexts, not Test Cases                                                                   |
| Readiness `NO_INCLUDED_ITEMS`                                                                           | A UI/UX plan is ready when contexts/criteria exist, not when specs are pinned                                                  |
| Strategy `verificationCapability` includes `accessibility`, `manual_verification`, `browser_automation` | Product disciplines are Functional UX / Responsive / Usability / Accessibility / Visual — overlapping names, different meaning |
| `qep.plan.execute` starts Test Case executions                                                          | Screen 3 Plan ≠ Screen 4 activity                                                                                              |

**Option A (Test Plan + planType only):** **Rejected.** Would force criteria into Specifications/Test Cases and pollute Test Plan membership.

**Option B (Test Plan envelope + additive profile):** Possible only by weakening Test Plan invariants (empty spec items, new readiness). High coupling to a package whose job is Test Case planning. Customer IA already says this is not merely another Test Plan.

**Option C (new lightweight aggregate):** **Recommended.** Identity, application, environment, owner, disciplines, planned experience contexts, criteria. Reuse Test Plan **only as optional trace**. Do not clone `qep-test-plans` approval/spec-pin/start-execution machinery.

### UI/UX Verification Activity — NEW

Screen 4 is live work (timer, pause, complete, current viewport, criterion results, capture). Rejected parents: TE (step pass/fail), workspace (suite steps), Exploratory Session (charter, not plan/criteria/viewport matrix), `qep-verification` (requirement decision).

Do **not** create `qep_ui_ux_execution` as a TE clone. Name it as a **verification activity** bound to the experience plan, not a Test Execution.

### UI/UX Criterion — NEW (lightweight)

| Candidate                                                                    | Why not SoR for Screen 4 criteria                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Test Case (`TEST_CASE_TYPES` includes `accessibility`, `manual`)             | Steps + expected result + execution pass/fail. Distorts Test Case if used for “focus is visible”.       |
| Specification types `usability \| accessibility \| mobile \| web \| desktop` | Classify Test Specifications. **Preserve historical meaning.** Do not migrate them into UI/UX Criteria. |
| Acceptance Criterion (`qep_acceptance_criterion`)                            | Define-layer, bound to Requirement / Story. Optional **trace**, not the criterion SoR.                  |
| `qep_acceptance_criterion_verification`                                      | AC verification join, not experience criteria.                                                          |

Criteria belong to the UI/UX Plan. Optional later mapping to Test Case / AC via traceability.

### Criterion Result — NEW

TE outcomes `passed|failed|blocked|…` and workspace `pass|fail|block|not_applicable` are Test Case step results. Product needs **Verified / Issue Found / Not Applicable / Not Verified** without implying Application Failed.

Do not map Complete → Passed. Status and quality stay separate (Phase 4 freeze).

### Verification Discipline — EXTEND (catalogue, not spec-type reuse)

Closest existing lists:

- `VERIFICATION_CAPABILITIES`: browser_automation, api_verification, accessibility, sast, dast, performance, manual_verification
- `SPECIFICATION_TYPES` / `TEST_CASE_TYPES`: usability, accessibility, mobile, web, desktop as **test classification**

Add **experience disciplines** as a small catalogue used by the experience plan: `functional_ux | responsive | usability | accessibility | visual`. Do **not** alias them to specification types. Accessibility appears in both lists with different jobs (automation capability vs experience discipline vs test classification). Keep those jobs separate; share the word in product copy, not one enum.

### Experience Context — NEW

`qep_application_execution_target.targetType` is `ci_pipeline | managed_runner | remote_host` (Phase 1E). That is **infrastructure**. Viewport/device/browser/OS/orientation is **experience context**. No repository object represents it. New planned-context records on the UI/UX Plan; current-context on the live activity.

### Viewport Matrix — DERIVED

No matrix table. Derive from planned experience contexts × criterion/activity results: planned / in progress / verified / issue found / not applicable.

### Progress — DERIVED

Exploratory: `areas marked explored / intended areas`.  
UI/UX: `experience contexts with a terminal context-state / planned contexts` and/or `criteria with a recorded result (excluding N/A from denominator as defined below)`.  
Not UX Score, Accessibility Score, Quality %, Release Readiness.

### Lifecycle — EXTEND (pattern, not TE columns)

Visual Draft / Planned / In Progress / Completed / Blocked / Pause are **not** enums to copy.

Reuse the **pattern** already proven:

- TE: `draft | ready | assigned | in_progress | paused | blocked | completed | cancelled | …`
- Workspace: `not_started | in_progress | paused | blocked | completed | cancelled | archived`
- Test Plan: `draft | review | approved | ready | in_execution | completed | …`

Recommend **smallest set on new aggregates**: `draft → planned → in_progress ⇄ paused → completed`, plus `blocked` and `cancelled`. Do not add TE review/accept/supersede onto Exploratory or UI/UX unless Owner later requires it.

### Pause / Resume — EXTEND pattern

`pauseExecution` / workspace `pause` already exist. Reimplement the same transitions on the new session/activity aggregates. Do **not** pause Exploratory by creating a TE.

### Activity / History — EXTEND pattern

TE: `qep_test_execution_history` + domain events (`test_execution.observation_recorded`, …).  
Plans: plan history.  
Platform Event SDK (029) exists for publish.

Recommend per-aggregate append-only history (same shape as TE history) **and** optional event publish. **Do not synthesize** from current state. Do not create a second global activity ledger if history-on-aggregate + events suffice.

### Evidence — EXTEND

`@apzhub/qep-evidence` remains SoR. Relationships already use string `targetCapability` + `targetId` (not a closed DB enum). Minimum: allow associate to new capabilities (`exploratory_session`, `experience_verification`, `quality_observation`, `quality_issue`, `experience_criterion`, `experience_context`) with existing provenance/integrity/tenant/access. Classification already includes screenshot/report/observation/export. **No new Evidence table.**

### Defect — EXTEND

`@apzhub/qep-defects` remains SoR. `DefectRelationshipKind` today: `test_execution | execution_session | execution_step | evidence | suite | …`. `ExecutionOrigin` snapshots TE/session/step at raise.

Minimum: add relationship kinds for quality issue / exploratory session / experience verification; extend origin snapshot with observation/issue/criterion/viewport labels (strings + ids, not a new Defect store). Create/link only via existing Defect API. **No automatic Defect creation.**

### Application — REUSE

`qep_application`. All new customer records `applicationId NOT NULL`. Server isolation like Phase 4 presented-executions. No unbound Phase 5 rows.

### Environment — EXTEND (reuse SoR + snapshot)

`qep_application_environment`. Reuse as live reference. **Snapshot** id + name at session/verification start (Phase 4 strategy-snapshot lesson): historical environment identity must not follow later Environment edits. No second Environment SoR.

### Traceability — EXTEND

`TRACE_ENDPOINT_KINDS` already has requirement, test_case, acceptance_criterion, test_execution, evidence, defect, verification_activity, …  
Add kinds for exploratory session, experience plan, experience verification, observation, issue **if** links are persisted as traces. Do not require Requirement/Test Case origin. Exploratory remains independently valid.

### AuthZ — EXTEND

Existing families: `qep.plan.*`, `qep.execution.*`, `qep.execution_workspace.*`, `qep.evidence.*`, defect permissions. **No exploratory / experience family today.**

Add a small family, e.g. `qep.exploratory.read|manage|perform` and `qep.experience.read|manage|perform` (or one `qep.quality_capture.*` plus workflow manage). Map onto existing `org_member` / QEP roles. **Do not introduce the nine-role catalogue in Phase 5.**

### Tenant / Application isolation — PASS (if implemented as specified)

Existing QEP tables use `tenant_id` + RLS (`app.tenant_id`) and Phase 1E `application_id`. New tables must copy that pattern. Unbound legacy Cap behaviour must not be used for new Phase 5 rows.

### Source independence — PASS

No Phase 5 object implies `source.read` / `source.write`. Application binding does not grant Source.

### Mobile — same APIs

No mobile domain. Screens 1–4 mobile consume the same authorities as desktop.

### Providers / tools — extension points only

Later: accessibility scanner, browser automation, visual comparison, device/browser provider. Bind as **secondary** provider runs (same rule as Phase 4 vitest): correlate; do not put provider names in the Phase 5 domain model. Not in this phase.

### Migration — none required for spec types

Do **not** promote existing Specifications typed `usability | accessibility | mobile | web | desktop` into UI/UX Criteria. They remain Test Cases / Specifications. No manufactured migration.

---

## 2. Existing tables / packages / APIs involved

| Package / table                                       | Role in Phase 5                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `qep_application`                                     | Bind all work                                                                                          |
| `qep_application_environment`                         | Environment reference + snapshot source                                                                |
| `qep_application_execution_target`                    | **Not** experience context                                                                             |
| `@apzhub/qep-test-plans` / `qep_test_plans`           | Optional trace only                                                                                    |
| `@apzhub/qep-test-management`                         | Strategy capabilities — do not overload as UI/UX disciplines                                           |
| `@apzhub/qep-test-execution`                          | Leave as Test Case execution. Optional later: keep TE observations as TE-only                          |
| `@apzhub/qep-execution-workspace`                     | Leave as suite sessions                                                                                |
| `@apzhub/qep-verification`                            | Leave as requirement/artefact verification                                                             |
| `@apzhub/qep-evidence`                                | Attach via relationships                                                                               |
| `@apzhub/qep-defects`                                 | Deliberate create/link                                                                                 |
| `@apzhub/qep-traceability`                            | Optional links; extend kinds                                                                           |
| `@apzhub/qep-definition` / `qep_acceptance_criterion` | Optional trace from criteria                                                                           |
| `@apzhub/platform-quality-intelligence`               | Not tester Observation                                                                                 |
| `platform-orchestration` `exploratory_testing`        | Policy hint only                                                                                       |
| Evidence / Defect / Plan / Execution HTTP             | Extend association and defect origin; no new Evidence/Defect routes required beyond relationship kinds |

---

## 3. Minimum proposed domain extensions

Shared **quality-capture** (used by both workflows, not a shared execution aggregate):

1. Observation
2. Issue (with Defect link/promote)
3. Note
4. Append-only activity/history on each workflow root (pattern from TE history)

Exploratory:

5. Exploratory Session (charter fields + areas + lifecycle + app + env snapshot + tester + timestamps)

UI/UX:

6. Experience Plan (not a Test Plan clone)
7. Planned Experience Contexts
8. Experience Criteria (on the plan)
9. Experience Verification activity (live workspace)
10. Criterion results (on the activity)

Plus: Evidence relationship capability strings; Defect relationship kinds + origin snapshot fields; Trace endpoint kinds; AuthZ permission strings; environment name snapshot on session/activity.

---

## 4. Tables genuinely required (if Owner accepts this lock)

Proposed names are **illustrative for Owner review**, not an implementation instruction:

| Table (illustrative)                                  | Why                                                       |
| ----------------------------------------------------- | --------------------------------------------------------- |
| `qep_exploratory_session`                             | Session SoR + charter + areas JSON or child rows          |
| `qep_experience_plan`                                 | UI/UX Plan SoR                                            |
| `qep_experience_context`                              | Planned device/viewport/browser/OS                        |
| `qep_experience_criterion`                            | Plan-owned criteria                                       |
| `qep_experience_verification`                         | Live Screen 4 activity                                    |
| `qep_experience_criterion_result`                     | Result per criterion per activity (and context if needed) |
| `qep_quality_observation`                             | Shared Observation                                        |
| `qep_quality_issue`                                   | Shared Issue                                              |
| `qep_quality_note`                                    | Shared Note                                               |
| history rows (per root or one `qep_quality_activity`) | Real events                                               |

Areas may be JSON on the session instead of a table. Disciplines may be a column/array on the plan instead of a table.

---

## 5. Tables explicitly NOT required

- `qep_execution` / third execution store
- `qep_ui_ux_execution` as a Test Execution clone
- Second Evidence store
- Second Defect store
- Second Application or Environment store
- Viewport Matrix persistence
- Quality / UX / Accessibility score tables
- Duplicate Test Plan item/approval/spec-pin tables
- Device-farm / BrowserStack / Figma / pixel-diff stores
- Migrated copies of historical `usability`/`accessibility` Test Cases

---

## 6. Relationship model

```text
qep_application
  └── qep_application_environment          (reuse; snapshot onto session/activity)

Exploratory Session (NEW)
  ├── charter (mission, scope, areas)      (session fields)
  ├── Observation / Issue / Note           (shared capture, subject = session)
  ├── Evidence                             (existing relationship)
  └── Defect                               (deliberate via Issue)

Experience Plan (NEW)
  ├── Experience Contexts (planned)
  ├── Experience Criteria
  ├── optional Trace → Test Plan / AC / Test Case / Requirement
  └── Experience Verification activity (NEW, many over time)
        ├── current Experience Context
        ├── Criterion Results
        ├── Observation / Issue / Note
        ├── Evidence
        └── Defect (deliberate via Issue)
```

Optional: one Observation/Issue may attach Evidence and later a Defect. Viewport/device is stored on the Observation/Issue as context refs, not inferred.

---

## 7. Lifecycle recommendation

| Workflow                | Suggested states                                                       | Pause                                            |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| Exploratory Session     | draft → planned → in_progress ⇄ paused → completed; blocked; cancelled | Same semantics as TE pause; owned by the session |
| Experience Plan         | draft → planned → in_progress → completed; cancelled                   | Plan is not the live timer                       |
| Experience Verification | planned → in_progress ⇄ paused → completed; blocked; cancelled         | On the **activity**, not the Plan                |

Complete ≠ UI Passed ≠ all Issues closed. Plan status ≠ activity status.

---

## 8. Progress derivation

**Exploratory:** `exploredAreaCount / intendedAreaCount`. If zero intended areas, progress is honest empty / not applicable — do not invent 100%.

**UI/UX contexts:** for each planned experience context, derive state from activity: no result → planned; activity current → in progress; all applicable criteria recorded without Issue Found → verified; any Issue Found → issue found; all N/A → not applicable.

**UI/UX criteria:** `recordedNonNaCount / applicableCount` where applicable = planned criteria minus Not Applicable.

Viewport Matrix = the context derivation, not a stored %.

---

## 9. Migration implications

**None** for existing Test Specifications typed usability/accessibility/mobile/web/desktop. They stay Test Cases.

No promotion of QI observations or TE observations into product Observation.

Orchestration `exploratory_testing` activities do not become Sessions.

---

## 10. Compatibility implications

Phase 3–4 Test Case / Execution / Retest / Rerun remain frozen. Phase 5 must not call `recordStepResult` for UI/UX criteria.

Test Plan list must not silently include Experience Plans unless Owner later wants a unified “plans” filter — default: **separate customer surfaces**.

`qep-verification` APIs stay requirement verification.

Provider automation remains secondary (Phase 4 freeze).

---

## 11. Security / AuthZ implications

- Tenant RLS on every new table (`app.tenant_id`).
- `applicationId` mandatory; list/get/mutate must reject cross-application ids.
- Evidence associate uses existing access checks; new target capabilities must not bypass grants.
- Defect create/link requires existing defect permissions **and** exploratory/experience perform.
- New permission family; compose onto current roles. No nine-role catalogue.
- Source permissions unchanged.

---

## 12. Genuine gaps

1. No Exploratory Session SoR.
2. No product Observation/Issue/Note shared capture.
3. No experience-plan / experience-context / experience-criterion / live UI/UX activity.
4. No experience-context vocabulary (viewport/device/browser).
5. No AuthZ family for exploratory/experience.
6. Trace endpoint kinds do not yet name these objects.
7. Defect origin snapshot cannot yet carry viewport/criterion/issue ids.
8. Pause/history patterns exist but are bound to TE/workspace/plans — must be **copied as pattern**, not reused as those tables.

---

## 13. Owner decisions required before implementation

**RESOLVED** 2026-08-20. Authority: [APZQEP-PHASE-5-DOMAIN-LOCK.md](./APZQEP-PHASE-5-DOMAIN-LOCK.md).

1. **UI/UX Plan persistence:** **NEW lightweight Experience Plan — APPROVED.** Option B (extend Test Plan) **rejected**.
2. **Shared capture package:** **APPROVED** — one Observation / Issue / Note model for both workflows.
3. **Two workflow roots:** **APPROVED** — Exploratory Session and UI/UX Verification Activity. Generic `quality_session` discriminator **rejected**.
4. **TE observations:** **REMAIN TE-ONLY.** No migration or reinterpretation as Phase 5 Observation.
5. **Criterion ↔ Test Case/AC:** optional traces only; Criterion is not automatically AC / Test Case / step.
6. **Experience Plan vs Test Plan in IA:** Screen 3 remains a separate nav surface. Test Plan stays scripted verification/execution strategy.
7. **Permission names:** extend existing QEP permission families; no nine-role catalogue. Exact family names at implementation.
8. **History:** extend existing audit/activity patterns; no duplicate generic history engine; real recorded events only.
9. **Environment snapshot:** reuse `qep_application_environment`; extend only where immutable verification-time context requires it.
10. **No implementation** until Owner reviews and authorises [APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md).

---

## PHASE 5 IMPLEMENTATION

NOT AUTHORISED

Domain lock is recorded. Inventory is drafted for Owner review. Do not implement. Do not start Phase 6. Illustrative table names in §4 remain **not** an implementation instruction.
