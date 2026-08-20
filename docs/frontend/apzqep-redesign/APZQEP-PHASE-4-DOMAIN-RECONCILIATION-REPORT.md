# APZQEP Phase 4 — domain reconciliation report

**Status:** ANALYSIS COMPLETE — **STOP FOR OWNER REVIEW**  
**Date:** 2026-08-19  
**Implementation:** NOT STARTED  
**Agenda:** [APZQEP-PHASE-4-DOMAIN-RECONCILIATION.md](./APZQEP-PHASE-4-DOMAIN-RECONCILIATION.md)

No schemas, migrations, APIs, UI, packages, seed, SSH, Terminal, Source write, Release, or AI were changed.

Locked visuals remain: [Screen 1](./APZQEP-PHASE-4-SCREEN-1-EXECUTIONS-RUNS.md) · [Screen 2](./APZQEP-PHASE-4-SCREEN-2-MANUAL-EXECUTION.md) · [Screen 3](./APZQEP-PHASE-4-SCREEN-3-AUTOMATED-EXECUTION-DETAIL.md) · [Screen 4](./APZQEP-PHASE-4-SCREEN-4-EXECUTION-RESULT-RETEST.md).

---

## Owner return block

```text
PHASE 4 DOMAIN RECONCILIATION:
COMPLETE

MANUAL EXECUTION AUTHORITY:
qep-test-execution — authoritative Test Case / step execution engine.
Extend; do not replace. Screen 2 maps to this aggregate.

SUITE SESSION AUTHORITY:
qep-execution-workspace — genuine Suite/session orchestration remains.
Keep. Do not merge. Do not use it as Screen 2 Test Case step SoR.
Placeholder Cap C steps (step-1…step-5) are not Test Case definition.

AUTOMATED EXECUTION AUTHORITY:
Customer automated Execution = qep-test-execution (mode automated | imported)
+ ingestExternalResult.
Provider run store = qep_automation_execution (platform-automation).
Correlate; do not list raw provider runs as customer Executions.

THIRD EXECUTION STORE:
NOT REQUIRED

CUSTOMER EXECUTIONS:
Composition / read model over both engines.
Already begun as PresentedExecution (TYPE, not a table) via
listPlanExecutions UNION of qep_test_execution + qep_execution_session.
Extend that composition. savePresentedExecution is a postgres no-op — keep it that way.

SCREEN 1 READ MODEL:
NEW COMPOSITION READ MODEL (extend existing PresentedExecution union)
Do not persist a parallel Executions SoR.

STATUS NORMALISATION:
Keep engine enums internal.
Customer Execution Status is operational (Queued / In progress / Paused /
Blocked / Completed / Cancelled / …).
Never map Completed → Passed.

RESULT NORMALISATION:
Customer Result from TE outcome / workspace step progress only.
Passed / Failed / Blocked / Not Run are presentation labels over existing
passed|failed|blocked|null (and workspace pass|fail|block|not_executed).
Do not add a third result enum to either engine.

EXECUTION TYPE:
DERIVE — do not add a new SoR enum.
Manual ← TE mode manual|assisted_manual OR strategy manual_verification
Automated ← TE mode automated|imported OR strategy automation capability
Mixed ← Plan-scoped composition containing both (derived at read time)
suite_session remains engine kind, not a customer Type.

PLAN → EXECUTION:
GAP
Strategy groups and Execution Plan handoff exist.
No customer “create Execution from Test Plan” that instantiates immutable
scope into Test Case executions. Execution Plan stays internal.

EXECUTION SCOPE:
EXTEND
Scope snapshot table + unit tests exist.
Live engine hook is best-effort and swallows errors.
Workspace still seeds placeholder steps, not suite members.

DEFINITION SNAPSHOT:
EXTEND
Phase 3 table + insert-once + unit tests exist.
TE already seals a separate manifest (instruction / expected / optional testDataRef).
Hooks are not in prepare/seal. Dual snapshot must be reconciled, not duplicated.

SCOPE SNAPSHOT:
EXTEND
Same as above. Survives later suite membership in unit tests only.

STRATEGY SNAPSHOT:
GAP
No strategy/environment/target snapshot table.
Strategy groups are mutable live records. Historical execution must copy
or freeze strategy fields at instantiation.

SNAPSHOT IMMUTABILITY:
EXTEND
Insert-if-absent in service. RLS tenant only. No UPDATE prohibition, no hash/seal
on Phase 3 snapshot rows. TE manifest is the only hashed “sealed” artefact (fnv1a).
Do not label Phase 3 snapshot rows “Sealed” until immutability is real.

TEST DATA:
Safe model = existing testDataRef / description only.
Literal non-secret text may live on definition/snapshot.
Dataset/fixture/generated/secret = reference string, never raw secret.
No QEP Vault. Do not copy credentials into snapshots, logs, or evidence metadata.

MANUAL STEP RESULTS:
EXTEND
TE already has Action(instruction) / Expected / Actual / outcome / evidence /
timestamps. Gaps: product Pass/Fail/Blocked mapping of extra states;
Save & Next as sequential UX over recordStepResult; defect raise from TE.

STEP EVIDENCE:
EXTEND
TE: evidenceIds on step + qep_test_execution_evidence_reference.step_order.
Workspace: evidenceRefs.stepId.
Evidence SoR relationships already accept targetCapability test_execution.
Minimum add: consistent associate to execution + step; do not new Evidence table.

AUTOMATION CORRELATION:
GAP
correlationId exists on TE and automation runs.
No durable FK from qep_automation_execution → TE / Plan / Test Case / strategy.
CI/SCM ingest is change events, not quality Executions.

PROVIDER RESULTS:
EXTEND
Normalise into TE outcome/steps via existing imported-mode ingest.
Keep provider JSON in automation store. Do not copy provider dashboards.

LOGS:
REFERENCE / FETCH ON DEMAND
Do not ingest unbounded CI/provider logs into APZQEP.

AUTOMATION ARTIFACTS:
Evidence reference preferred; ingest only when the artefact is quality proof.
qep_automation_execution.artifacts already has uri/sha256/kind.
Do not duplicate into a second artefact SoR.

EVIDENCE:
EXTEND
Existing Evidence SoR is sufficient. Preserve provenance, hash/seal, grants, RLS.

MANUAL EXECUTION → DEFECT:
EXTEND
Workspace createFromExecution is live (session-scoped).
TE: qep_test_execution_defect + qep_defect.test_execution_id + relationship
kind test_execution exist; HTTP raise-from-TE is not wired. Reuse Defect service.

AUTOMATED EXECUTION → DEFECT:
EXTEND
Human create/link from failed TE, prepopulated from failure context.
Do not auto-create Defects from provider failed state.

RETEST:
NEW Execution (TE) + additive relationship metadata
(previous_execution_id + triggering_defect_id + relation_kind=retest).
Do NOT reuse supersede (that terminals the original as superseded).

RERUN:
NEW Execution + relation_kind=rerun + previous_execution_id.
May reuse create-with-supersedesId only if original historical Failed/Passed
remains listable. Prefer explicit relation over status=superseded.

RERUN / RETEST DISTINCTION:
EXTEND
Same mechanism (new Execution + relation kind). Different eligibility and Defect effect.

HISTORY:
EXTEND
Compose TE history/audit, workspace historyJson, Defect history, Evidence events.
Do not synthesise missing events.

LINKED RECORDS:
EXTEND
Requirement → Story → AC → Test Case exists (Phase 2/3).
Suite / Plan membership exists.
Execution / Evidence / Defect links exist per engine, incomplete across engines.
Retest Execution: GAP until relation metadata exists.

APPLICATION BINDING:
EXTEND
Phase 1E qep_application is canonical.
application_id is nullable on TE/session. Unbound remains honest Unbound.
project_id remains legacy on TE (required today).

ENVIRONMENT:
EXTEND
Strategy holds qep_application_environment.id.
Workspace planning snapshot stores environmentLabels (strings).
Copy id + name into execution/strategy snapshot at start.

EXECUTION TARGET:
EXTEND
Phase 1E types only: ci_pipeline | managed_runner | remote_host.
Web / API / Repository are surfaces, not targets.
Snapshot target type+id+name at start. Remote Host = configuration only.

TENANT ISOLATION:
PASS
RLS present on both engines, snapshots, defects, evidence, applications.
Workspace handoff checks tenant. Snapshot policies use FORCE + WITH CHECK.

APPLICATION ISOLATION:
GAP
Phase 3 enforces same application on Suite/Plan membership and AC links.
TE create does not assert qep_application vs spec/plan/environment/target.
Must add at execution instantiation — do not invent cross-application execution.

AUTHZ:
EXTEND
Two permission families already exist.
Composition reads need union of qep.execution.read + qep.execution_workspace.read.
No dedicated rerun/retest permission; reuse create/execute + defects.lifecycle.
Nine-role catalogue out of scope.

SOURCE INDEPENDENCE:
PASS

RELEASE:
NOT CREATED
(defect.releaseReference and plan type “release” are legacy strings only)

SSH:
NOT AUTHORISED

TERMINAL:
NOT AUTHORISED

AI:
NOT IMPLEMENTED

SERVICE.YAML:
NOT REQUIRED for @apzhub/qep-test-management
Reason: it is a domain/package module (Test Case/Suite/Plan strategy + snapshot
helpers), not an independently deployable Platform Service.
Stub services/qep/services/qep-execution/service.yaml already exists as
placeholder — do not implement business logic there to “unify” engines.

PHASE 4 IMPLEMENTATION:
NOT STARTED
```

---

## 1. Dual-engine inventory

### 1.1 Formal Test Execution — `@apzhub/qep-test-execution` / `qep_test_execution`

| Topic                | Repository truth                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aggregate            | One Test Execution = one executed Test Case (spec ref) optionally linked to a plan                                                                                                              |
| Identifier           | Opaque id + unique `(tenant, execution_number)`                                                                                                                                                 |
| Application          | Nullable `application_id` (Phase 3 additive). **Required** `project_id` + `workspace_id` (legacy)                                                                                               |
| Plan                 | Optional `plan_ref_*`                                                                                                                                                                           |
| Suite                | None on the row                                                                                                                                                                                 |
| Test Case            | Optional `spec_ref_*` + version label                                                                                                                                                           |
| Steps                | `qep_test_execution_step` — instruction, expected, actual, outcome, evidence ids, reasons, timestamps                                                                                           |
| Snapshot             | Sealed `qep_test_execution_manifest` (hash, sealed_at/by, steps JSON including optional `testDataRef`) **plus** Phase 3 `qep_execution_definition_snapshot` (parallel, not hooked into prepare) |
| Status               | `draft → ready → assigned → in_progress ⇄ paused/blocked → completed → submitted_for_review → accepted/rejected`; also `cancelled`, `superseded`                                                |
| Result               | Separate `outcome`: `passed \| failed \| blocked \| inconclusive \| cancelled`. Review may override after `pre_review_derived_outcome`                                                          |
| Assignment           | owner, executor, reviewer, agentIdentity                                                                                                                                                        |
| Environment / target | Not first-class columns; `context_json` bag only                                                                                                                                                |
| Automation           | `mode`: `manual \| assisted_manual \| automated \| imported`; `ingestExternalResult` for imported                                                                                               |
| Evidence             | Step `evidence_ids_json` + `qep_test_execution_evidence_reference` (`step_order`, uri, integrity_hash)                                                                                          |
| Defect               | No native raise. Phase 3 link table + `qep_defect.test_execution_id` unused by TE HTTP                                                                                                          |
| Audit / history      | `qep_test_execution_history`, `_audit`, `_outbox`                                                                                                                                               |
| API                  | `/api/v1/qep/executions` (+ assigned, review-queue, manifest, steps, observations, ingest, actions)                                                                                             |
| UI                   | Legacy workbench `qep-test-execution-views` — **not** Phase 4 Screens 1–4. Classification **D** for presentation                                                                                |
| Write path           | Platform service `QepTestExecutionPlatformService` → command service → domain → postgres                                                                                                        |

**Classification:** **B** for Screen 2 / Screen 4 Test Case result. **A** for pause/resume, status≠result, sealed step snapshot (manifest). **C** for Plan-scope instantiation, strategy/env/target snapshot, retest relation, TE→Defect HTTP.

### 1.2 Suite session — `@apzhub/qep-execution-workspace` / `qep_execution_session`

| Topic                                     | Repository truth                                                                                                                                                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aggregate                                 | One session per Execution Plan **handoff** (idempotent)                                                                                                                                                                                     |
| Identifier                                | `sessionId`; unique `(tenant, handoff_id)`                                                                                                                                                                                                  |
| Application                               | Nullable `application_id`; optional `project_id`                                                                                                                                                                                            |
| Plan                                      | `plan_id` + `PlanningSnapshot` (plan name, suite id+**version**, environment **labels**, assignees)                                                                                                                                         |
| Suite                                     | `suite_id` in snapshot; **membership not expanded into Test Case rows**                                                                                                                                                                     |
| Test Case                                 | None                                                                                                                                                                                                                                        |
| Steps                                     | JSON checklist. `defaultStepsFromPlan` seeds **five placeholder titles** (`step-1`…`step-5`) “until Cap A cases ship”                                                                                                                       |
| Snapshot                                  | PlanningSnapshot in session JSON + Phase 3 scope snapshot on create (best-effort)                                                                                                                                                           |
| Status                                    | `not_started → in_progress ⇄ paused/blocked → completed/cancelled → archived`                                                                                                                                                               |
| Result                                    | **No outcome column.** Progress counters derived from step outcomes. Plan Executions tab currently maps **status** through `mapOutcomeToProductResult` — `completed` becomes **not_run**. This is a presentation defect, not a product rule |
| Pause / resume / block / cancel / archive | **Exists**                                                                                                                                                                                                                                  |
| Evidence                                  | `evidenceRefs` with optional `stepId`                                                                                                                                                                                                       |
| Defect                                    | **Authoritative raise path:** `createFromExecution(sessionId, stepId?)` copies origin + evidence                                                                                                                                            |
| Amendment                                 | After complete/archive, `amendStepResult` with reason; original session remains                                                                                                                                                             |
| API                                       | `/api/v1/qep/execution-sessions`                                                                                                                                                                                                            |
| UI                                        | Cap C workspace — **D** vs Phase 4 visuals                                                                                                                                                                                                  |
| Write path                                | `createFromHandoff` ← Execution Plan `handed_off`                                                                                                                                                                                           |

**Classification:** **A** as Suite/session orchestration + defect origin + pause. **C** as Screen 2 Test Case executor. **B** to participate in Screen 1 list as a session row (needs honest Status vs Result).

**Continuing role (section 5):** remains true after Phase 4 analysis. It is not an accidental duplicate of TE. It is a different grain: **suite-run session** vs **executed Test Case**. Keep both. Do not preserve placeholder steps as product IA.

### 1.3 Provider automation store — `@apzhub/qep-automation` / `qep_automation_execution`

Not a customer Execution. Provider-neutral `AutomationExecutionRecord` JSON (`queued|preparing|running|…|completed|failed|…`) with artifacts (screenshot/video/trace/log) and `evidenceRefs`. **`failed` is a lifecycle state**, not a Test Case result.

**Classification:** **B** as Screen 3 provider sidecar. **Must not** appear as Screen 1 Execution rows unless correlated to a TE.

### 1.4 Other related stores (retain, do not promote)

| Store                                                                                  | Role                                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `qep_test_plans` + items + `qep_test_plan_suite_item` + `qep_test_plan_strategy_group` | Customer Test Plan + strategy                                 |
| `qep_execution_plan`                                                                   | Internal WHEN/WHERE/HOW + Cap C handoff — **not** customer IA |
| `qep_suite` + `qep_suite_item`                                                         | Suite + Test Case membership                                  |
| `qep_test_specifications` + `qep_test_specification_step`                              | Test Case definition                                          |
| `qep_test_case_automation_mapping`                                                     | Capability / provider / asset on Test Case                    |
| `qep_evidence*`                                                                        | Sole Evidence SoR                                             |
| `qep_defect`                                                                           | Sole Defect SoR                                               |
| `qep_application*`                                                                     | Phase 1E application / environment / target                   |
| `qep_scm_*`                                                                            | Change events / webhooks — not Executions                     |
| `testing_*` / `testing_manual_execution`                                               | Legacy TCMS — do not revive as Phase 4 SoR                    |
| Stub `services/qep/services/qep-execution/service.yaml`                                | Placeholder; no business implementation                       |

---

## 2. Customer Execution identity (no third SoR)

**Customer Execution** is a **composed view** of:

1. **Test Case execution** (`qep_test_execution`) — primary grain for Screens 2–4.
2. **Suite/session execution** (`qep_execution_session`) — Plan/Suite operational envelope for Screen 1 (and session investigation).

Phase 3 already implemented a live UNION in `listPlanExecutions` and typed it `PresentedExecution`. Postgres `savePresentedExecution` is intentionally empty: _“Formal TE / workspace sessions remain the execution stores.”_

That is the correct composition. Screen 1 should **extend the read model** (more fields, tenant+application filter, Status≠Result, progress, environment/method from snapshot/strategy) and expose it as `/api/v1/qep/executions` **composition**, without inserting `qep_execution`.

A parent/child **relationship** (session has many TE rows) is a later additive link if Plan instantiation creates both a session envelope and N Test Case executions. That is a relationship, not a third store.

**Do we need `qep_execution`?** **NO.** Unavoidable-reason test fails: both engines already persist durable executions; a unifying table would duplicate identity and invite drift.

---

## 3. Screen 1 read model

Existing `PresentedExecution` fields: id, tenant, optional application/plan/suite/specification, `mode`, `engine`, `result`, executedAt, executedBy. Missing vs locked Screen 1: name, environment, method/capability, **status**, progress, owner, started, updated.

| Field             | Source                                                                | Action                                                                 |
| ----------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Execution ID      | TE `execution_number` / session id                                    | Present; do not invent EX-* SoR. Optional display alias is Owner later |
| Name              | TE spec title via snapshot/spec; session `name`                       | Read compose                                                           |
| Plan              | `plan_ref_id` / session `plan_id`                                     | Exists                                                                 |
| Type              | Derive from mode + strategy (see §10)                                 | Derive                                                                 |
| Environment       | Strategy `environment_id` / snapshot (GAP) / workspace labels         | Extend snapshot                                                        |
| Method            | Strategy capability / TE mode                                         | Derive                                                                 |
| Status            | TE `status` / session `status`                                        | **Must add**; stop stuffing into `result`                              |
| Result            | TE `outcome`; session = derived from steps or **null until complete** | Fix mapper                                                             |
| Progress          | TE steps accounted; session `progress.percentComplete`                | Derive                                                                 |
| Owner             | TE `owner_id` / session `ownerId`                                     | Exists                                                                 |
| Started / Updated | TE timestamps / session `startedAt` `updatedAt`                       | Exists                                                                 |

Honest empty state already exists on Plan Executions tab. Dual-engine live rows were not shown in Phase 3 — Screen 1 is that list.

---

## 4. Status and result mapping

### 4.1 Status (operational)

| Customer (presentation) | TE                                                  | Workspace           | Automation provider (internal only) |
| ----------------------- | --------------------------------------------------- | ------------------- | ----------------------------------- |
| Draft / Ready           | draft, ready                                        | not_started         | queued, preparing                   |
| Assigned                | assigned                                            | —                   | —                                   |
| In progress             | in_progress                                         | in_progress         | running, retrying                   |
| Paused                  | paused                                              | paused              | interrupted (lossy)                 |
| Blocked                 | blocked                                             | blocked             | —                                   |
| Completed               | completed, submitted_for_review, accepted, rejected | completed, archived | completed                           |
| Cancelled               | cancelled                                           | cancelled           | cancelled, timed_out                |
| Superseded              | superseded                                          | —                   | —                                   |

**Lossy:** TE `accepted`/`rejected` are review statuses, not quality results — present as Completed + Result. Provider `failed`/`timed_out` are run failures, not Test Case Failed. Workspace `archived` is storage, not a quality state.

### 4.2 Result (quality)

| Customer            | TE `outcome` / step                              | Workspace step                 | Do not map from       |
| ------------------- | ------------------------------------------------ | ------------------------------ | --------------------- |
| Passed              | passed                                           | pass                           | status=completed      |
| Failed              | failed                                           | fail                           | provider state=failed |
| Blocked             | blocked                                          | block                          | —                     |
| Not Run             | null outcome / not_executed                      | not_executed                   | draft/in_progress     |
| (retain internally) | skipped, not_applicable, inconclusive, cancelled | skip, not_applicable, deferred | —                     |

TE overall derivation precedence: **failed > blocked > inconclusive > cancelled**; else all pass-like (`passed|skipped|not_applicable|not_executed`) → **passed** unless _only_ `not_executed` → inconclusive.

Workspace has **no** overall result deriver. Recommend: after session complete, derive analogously from steps; while in progress Result = Not Run / partial — never Completed=Passed.

Product labels Pass/Fail vs passed/failed are **presentation**. Do not rename engine enums.

---

## 5. Plan → Execution and scope

Current chain:

```text
Test Plan (customer)
  → strategy groups (capability, surface, environment_id, target type/id, mapping, testDataRef)
  → (optional internal) Execution Plan → scheduled → handed_off
       → Workspace session (placeholder steps)
Test Execution is created independently with planRef/specRef; prepare() seals a resolved manifest.
```

**Missing for deterministic Screen 1/2 creation:** a governed instantiation that:

1. Expands Plan scope (suites ∪ individual Test Cases) into an **immutable member list**.
2. Writes `qep_execution_scope_snapshot` **authoritatively** (must not swallow errors).
3. For **manual** (and mixed manual members): creates **one TE per Test Case** with specRef + planRef, then prepare from **definition snapshot** (not live definition).
4. Optionally creates **one workspace session** as the Suite/Plan envelope when the internal Execution Plan handoff path is used.
5. Copies strategy/environment/target into a freeze (new snapshot or TE context + session planning fields with **ids**, not only labels).

Until that exists, Screen 1 cannot honestly show Plan-originated runs except ad-hoc TE or Cap C sessions.

---

## 6. Snapshots — why Phase 3 said PARTIAL

Confirmed against code, not the Phase 3 report alone:

1. Tables exist (`qep_execution_definition_snapshot`, `qep_execution_scope_snapshot`).
2. Service methods exist; insert-once (`if existing return`).
3. Unit tests prove definition v1 survives v2 edit, and suite A stays A after B is added.
4. HTTP hooks `captureExecutionSnapshots` on TE **create** and session **create** — **try/catch empty**. Create of TE often has specRef; session has suite/plan. **prepare/seal is not hooked** — the TE manifest is the real step freeze for execution, while Phase 3 snapshot may capture definition **before** prepare, or fail silently.
5. Workspace **does not** replace placeholder steps with snapshotted members.
6. No strategy snapshot.
7. No DB trigger / column-level immutability / content hash on Phase 3 rows.
8. No live-engine Playwright proof (create → edit definition → historical unchanged).

**Minimum closure:**

| Need                                                                       | Copy into snapshot                                             | Durable reference |
| -------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------- |
| Test Case id, number, definitionVersion                                    | copy                                                           | id                |
| Ordered steps: action, testDataRef, expected                               | copy (already)                                                 | —                 |
| Suite/plan member ids                                                      | copy (already)                                                 | plan_id, suite_id |
| Strategy capability, surface, env id+name, target type+id+name, mapping id | **copy**                                                       | ids               |
| Environment current URL/config                                             | copy name/category; **do not** copy secrets from `config_json` | environment_id    |
| TE manifest                                                                | already sealed copy of instruction/expected                    | spec/plan refs    |

**Immutability recommendation (smallest genuine):** service no-update (already) **plus** reject UPDATE in repository **plus** hook capture into TE `prepareExecution` and session create **without swallowing**. Optional content hash later; do not claim “Sealed” in UI until that hook is non-optional. Reuse Evidence sealing only for Evidence.

If TE manifest and Phase 3 definition snapshot both remain, Screen 4 must **prefer TE manifest for executed steps** and Phase 3 snapshot for identity/version/membership — or merge at prepare so they cannot diverge. Do not maintain three step lists (definition table, Phase 3 JSON, manifest JSON, workspace placeholders).

---

## 7. Manual step execution (Screen 2)

TE already matches the locked definition/execution split:

- Definition (manifest): instruction, expected, testDataRef, preconditions
- Execution: actualResult, outcome, evidenceIds, block/skip/na reasons, startedAt, completedAt, attemptCount

**Save Step Result** = existing `recordStepResult` (requires status `in_progress`; overwrites the same step; history event per write).  
**Save & Next** = same command + client moves to next order — **no new SoR**.  
Partial save: actualResult can be stored with an outcome; passed requires actual when `requireActualResult`. There is no “draft step outcome” distinct from recorded outcome.

**Completed step editing:** while `in_progress`, TE allows overwrite (attemptCount does not increment on rewrite). After `complete`, steps are immutable (STEP_MUTABLE = in_progress only). Workspace: overwrite until complete; then **amendment** with reason.

**Phase 4 rule (fits repo):** editable until Test Case execution completion; after completion, TE stays immutable; session-level amendment remains workspace-only. Do not add reopen unless Owner later asks — TE already has review reject / supersede instead.

**Pause/Resume:** both engines support pause/resume. TE also block/resume. Screen 2 Pause is **not new**.

**Overall Test Case result:** `OutcomeDeriver.deriveFromSteps` on complete — keep derived, not editable (review override is a separate certified path; Screen 4 should show derived vs accepted).

**Overall Execution (Plan/Suite) result:** derive from child TE outcomes + session progress; never an editable verdict. Exception: cancelled children do not flip parent to Passed.

---

## 8. Automation, logs, artifacts (Screen 3)

Flow today: platform-automation engine writes `qep_automation_execution`; optional `evidenceRefs`; TE ingest is a **separate** imported-mode API keyed by sourceSystemId + idempotencyKey.

**Correlation GAP:** same `correlationId` convention, no FK. Minimum additive: `qep_automation_execution` columns or a link table `(tenant_id, test_execution_id, automation_execution_id)` — **relationship**, not a third Execution.

Provider result normalisation: map provider terminal state + provider-neutral result summary into TE step outcomes via existing ingest. Keep Playwright/SAST/DAST/k6 JSON in automation store.

Logs: artifacts `kind=log` with uri — **fetch/reference**. Observations on TE are tester notes, not CI logs.

Artifacts classification:

| Kind                                         | Pattern                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| screenshot, video, trace (quality proof)     | Evidence ingest **or** Evidence reference to stored object             |
| HTML report, coverage, security/perf reports | Evidence reference or execution artefact metadata on automation record |
| unbounded logs                               | reference only                                                         |

---

## 9. Evidence and Defects

**Evidence:** sole SoR. Relationships are capability+targetId strings (`test_execution` proven). Grants, hash, seal, download ACL exist. TE and workspace already **reference** evidence ids at execution and step grain. Minimum: always associate Evidence → execution id (+ step order/id); optional `targetCapability` values `test_execution_step` / `execution_session` if not already used — **no new Evidence table**.

**Defects lifecycle (actual):**  
`new → triaged → assigned → in_progress → fixed → ready_for_retest → verified → closed`  
plus `rejected | duplicate | wont_fix | archived`. Matches expected. **Do not change.**

**Why Phase 3 Defects PARTIAL:** link table + `test_execution_id` column exist; `relateDefectToTestExecution` is unit-tested; **workspace HTTP `createFromExecution` is the only raise-from-execution write path**. TE UI/API does not call it. Origin type already includes `testExecutionId` / `execution_step`.

**Automated → Defect:** user creates via Defect service with TE id + step + prefilled expected/actual/environment/evidence. Provider `failed` must not auto-open Defects.

Fixing a Defect **must not** rewrite TE `outcome`. Nothing in TE currently listens to Defect lifecycle — **invariant already holds** if we do not add a back-write.

---

## 10. Retest and Rerun

TE `supersedes_id` / `superseded_by_id` + action `supersede` marks the **original status superseded** (terminal) and hides it from some query lists. That is **operational replacement**, not Screen 4 retest.

|                       | Rerun                                          | Retest                                                                                                    |
| --------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| New Execution         | Yes                                            | Yes                                                                                                       |
| Previous execution id | Yes                                            | Yes                                                                                                       |
| Defect id             | No                                             | Yes (trigger)                                                                                             |
| Eligibility           | prior execution exists; diagnostic/flake/infra | Defect `ready_for_retest` (or equivalent Owner-confirmed) + failed verification context                   |
| Original result       | Unchanged                                      | Unchanged (**Failed stays Failed**)                                                                       |
| Original status       | Prefer remain completed/accepted               | Must remain historically Failed/completed — **do not supersede**                                          |
| On pass               | No auto Defect verified                        | Defect **eligible** for `verified` via existing `ready_for_retest → verified`; human lifecycle permission |
| On fail               | New Failed execution                           | Defect stays/re-enters `in_progress` (existing transition from `ready_for_retest`)                        |

**Smallest model:** additive nullable columns **or** a thin `qep_test_execution_relation` (`from_id`, `to_id`, `kind=rerun|retest`, `defect_id?`). Prefer TE-only first (Screen 4 grain is executed Test Case). Session-level retest can wait.

**Scope (Phase 4 smallest):** retest the **failed Test Case** (one new TE). Suite/Plan-wide retest is later. Strategy: **copy prior execution’s frozen strategy/env/target**; show it; do not silently use today’s Plan strategy.

---

## 11. Screen 4 composition

Compose, do not copy:

| Area                          | API / store                                                                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test Case context (read-only) | Definition snapshot + spec read                                                                                                                             |
| AC                            | Phase 3 criterion links / trace `acceptance_criterion` → `test_specification`                                                                               |
| Execution summary             | TE DTO                                                                                                                                                      |
| Snapshot                      | Manifest + definition/scope/strategy freeze                                                                                                                 |
| Steps / failure               | TE steps                                                                                                                                                    |
| Evidence                      | Evidence query by relationship + TE refs                                                                                                                    |
| Defects                       | Defect list by `test_execution_id` / link table                                                                                                             |
| History                       | TE history + Defect history + Evidence events (union, typed, no synthesis)                                                                                  |
| Linked records                | Traceability (`requirement_tested_by`, `testcase_executed_by`, `execution_evidenced_by`, `execution_defected_by`) + membership + retest relation when added |
| Retest chain                  | relation metadata                                                                                                                                           |

Coverage ≠ result remains: AC links stay even if Failed; Passed does not imply full AC coverage.

---

## 12. Isolation, authz, mobile, Source, Release, AI

- **Tenant:** RLS + FORCE on Phase 3 tables; TE/session/evidence/defect RLS exist. Workspace handoff rejects cross-tenant.
- **Application:** enforced on Test Case/Suite/Plan membership and AC. **Not** on TE create vs spec/env/target — **GAP** to close at instantiation.
- **Authz:** `qep.execution.*` (read/create/prepare/assign/execute/control/review/supersede/ingest/admin) and `qep.execution_workspace.*` (read/create/execute/lifecycle/amend/admin). Defects `qep.defects.{read,create,update,lifecycle}`. Evidence `qep.evidence.{read,create,associate,seal,download,…}`. Sufficient to start; composition list = union; rerun/retest = create+execute (+ defects.lifecycle for verification). No nine-role work.
- **Mobile:** same handlers; Screen 1 list and Screen 4 get-by-id must return dense JSON (tabs are client). No separate mobile backend. Watch pagination on UNION.
- **Source:** TE ingest `source_system_id` is automation identity, not `source.read/write`. Unchanged.
- **Release / SSH / Terminal / AI:** not created, not authorised, not designed.

---

## 13. `@apzhub/qep-test-management` and service.yaml

Package owns Test Case steps, suite/plan membership, strategy groups, automation mappings, snapshot helpers, and the **PresentedExecution UNION**. It is not a deployable service, has no `service.yaml`, and should not gain one “to clear debt”. Platform Service remains the TE gateway + future composition query in `platform-services` if a 027 manifest is required at implementation — that is a **new read service** decision at implementation lock, not a reason to stub-fill `qep-execution`.

---

## 14. Phase 2 recertification (not a regression run)

This analysis does not reopen Phase 2. Screen 4 **reads** AC/story/requirement links. Implementation should not mutate Definition/AC write paths. Later regression: Phase 2 Playwright if trace endpoints or AC presentation components are touched; otherwise Phase 2 remains ACCEPTED.

---

## 15. Required lists for Owner

### 15.1 Retain

Packages: `qep-test-execution`, `qep-execution-workspace`, `qep-execution-plans` (internal), `qep-test-plans`, `qep-suites`, `qep-test-specifications`, `qep-test-management`, `qep-evidence`, `qep-defects`, `qep-traceability`, `qep-automation`, `qep-applications`, `qep-definition`.  
Tables listed in §1.  
APIs: existing TE, sessions, defects (including from-session), evidence, plan executions UNION, applications/env/targets.

### 15.2 Extend

- `PresentedExecution` / `listPlanExecutions` → Screen 1 composition (status, progress, env, method, name)
- Snapshot capture: fail closed on create/prepare; freeze strategy
- TE → Defect HTTP using existing `create` + `testExecutionId` / `relateDefectToTestExecution`
- Application isolation on execution instantiation
- Screen 2/4 presentation over TE (replace legacy workbench UX — classification D)
- Screen 3 presentation over TE + automation sidecar

### 15.3 Minimum additive schema (proposed only — not created)

| Change                                                                   | Why existing is insufficient                                 | Screen | Historical migration | Additive |
| ------------------------------------------------------------------------ | ------------------------------------------------------------ | ------ | -------------------- | -------- |
| Execution relation (`rerun`/`retest` + previous id + optional defect id) | supersede terminals original; no Defect link on rerun/retest | 3, 4   | No (new rows only)   | Yes      |
| Strategy/environment/target freeze (columns on snapshot or JSON freeze)  | strategy groups mutate; workspace has labels not ids         | 1–4    | No                   | Yes      |
| Optional `automation_execution_id` on TE or link table                   | correlationId only                                           | 3      | No                   | Yes      |
| Optional session↔TE children link                                        | Plan envelope vs Test Case grain                             | 1, 2   | No                   | Yes      |
| **Not** `qep_execution`                                                  | Would duplicate                                              | —      | —                    | Rejected |

### 15.4 Composition / read models

- Screen 1: UNION + normalisation mapper (Status vs Result)
- Screen 4: TE get + snapshot get + evidence query + defects by TE + history union + trace links
- Screen 3: TE get (automated/imported) + automation record by correlation/FK

### 15.5 Compatibility

Keep TE and workspace enums. Presentation mapper in the composition layer. Keep `suite_session` as engine kind internally. Keep Execution Plan internal. Keep `TS-*` / specification APIs. Do not rename `passed` → `pass` in TE.

### 15.6 Migration

No historical backfill required to start: empty Executions is honest. Old Cap C placeholder sessions remain sessions, not fake Test Case results. Unbound `application_id` stays Unbound. Additive columns only.

### 15.7 Regression later (when implementation is authorised)

Phase 3 Test Case/Suite/Plan Playwright; TE unit/API; workspace+defect from session; Evidence access; **not** Phase 2 unless AC/trace writes change. Phase 1E application/env/target isolation tests.

### 15.8 Unresolved Owner decisions

1. Confirm TE = Screen 2/4 Test Case authority and workspace = Suite/session envelope (repository-backed recommendation above).
2. Confirm **no** `qep_execution` table.
3. Confirm retest **must not** call `supersede`.
4. Plan instantiation: always N TE rows, optional session envelope, or session-only for Suite until TE children exist.
5. Whether UI may say “Sealed” before Phase 3 snapshots gain non-optional capture + no-update enforcement (TE manifest already sealed).
6. Display IDs `EX-*` vs existing `execution_number` / session ids (illustrative in visuals).
7. Whether TE review accept/reject remains visible in Phase 4 or is deferred (exists in engine).

### 15.9 Genuine blockers

**None that block this reconciliation.**  
Implementation remains **not authorised**.  
Engineering cannot honestly deliver Screen 2 on workspace-as-is (placeholder steps). That is a **scope/design constraint**, not a reason to invent a third store.

---

PHASE 4 IMPLEMENTATION:  
NOT STARTED

STOP FOR OWNER REVIEW.
