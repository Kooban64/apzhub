# APZQEP Phase 3 — domain reconciliation report

**Status:** ANALYSIS COMPLETE — **STOP FOR OWNER REVIEW**  
**Date:** 2026-08-19  
**Implementation:** NOT STARTED  
**Instruction:** [APZQEP-PHASE-3-DOMAIN-RECONCILIATION-INSTRUCTION.md](./APZQEP-PHASE-3-DOMAIN-RECONCILIATION-INSTRUCTION.md)

No schemas, migrations, APIs, UI, packages, seed, SSH, Terminal, Source write, or AI were changed.

Visual authorities remain: [Screen 1](./APZQEP-PHASE-3-SCREEN-1-TEST-CASE-LIBRARY.md) · [Screen 2](./APZQEP-PHASE-3-SCREEN-2-TEST-CASE-DESIGNER.md) · [Screen 3](./APZQEP-PHASE-3-SCREEN-3-TEST-SUITES.md) · [Screen 4](./APZQEP-PHASE-3-SCREEN-4-TEST-PLANS.md).

---

## Owner return block

```text
PHASE 3 DOMAIN RECONCILIATION:
COMPLETE

SPECIFICATION → TEST CASE:
EXTEND

TEST CASE STEPS:
EXTENSION REQUIRED

TEST CASE KEY:
Retain durable Specification.number (conventionally TS-*). Present the object as Test Case. Do not renumber history. Optional application-scoped TC-n alias is an Owner decision, not required for SoR safety.

SUITE DOMAIN:
EXTEND

SUITE MEMBERSHIP:
EXTENSION REQUIRED

SUITE KEY:
SUITE-n unique per tenant + qep_application. Do not use TS-*.

TEST PLAN:
EXTEND

EXECUTION PLAN:
Retain as internal/orchestration (WHEN/WHERE/HOW + Cap C handoff). Not a second customer-facing Plan. Customer object = Test Plan + Execution Strategy.

EXECUTION STRATEGY:
Authoritative on Test Plan (new strategy-group records). Execution Plan may realise a Suite-scoped group; do not duplicate assignment onto Test Case or Suite.

AUTOMATION MAPPING:
Test Case (Specification) → durable mapping to capability + configured provider/asset → Plan strategy selects which mapping/capability to run. Today mappings are a JSON ledger, not specification FK.

ENVIRONMENT:
REUSE PHASE 1E
(Execution Plan today stores label refs — bind those to qep_application_environment.id)

EXECUTION TARGET:
REUSE PHASE 1E / GAP
(1E types are ci_pipeline | managed_runner | remote_host, not Web | API | Repository. Owner mapping required.)

TEST DATA:
EXTEND / GAP
(Per-step description/reference on definition steps. No QEP dataset/secret SoR. No raw secrets on Test Case.)

DUAL EXECUTION MODEL:
Two genuine concepts, not accidental duplicates. Keep both. Formal step execution = qep-test-execution (matches Designer). Suite-session workspace = qep-execution-workspace (Cap B handoff, defects). Do not merge. Do not add a third store.

EXECUTION SNAPSHOT:
PARTIAL EXISTING / EXTENSION REQUIRED
(Test Execution seals instruction/expected. Workspace snapshots suite id+version but Suites have no members. Suite membership snapshot required once membership exists. Add testData to sealed steps.)

AC → TEST CASE TRACEABILITY:
EXTENSION REQUIRED
(Phase 2 links AC → test_specification only. TRACE_ENDPOINT_KINDS has test_specification and test_case, not acceptance_criterion.)

TEST CASE → EXECUTION:
EXTENSION REQUIRED
(Test Execution already refs spec + optional plan. Workspace does not ref specifications. Product chain needs both joined to the Plan.)

EXECUTION → EVIDENCE:
PASS
(Both engines attach evidence by reference to existing Evidence SoR.)

EXECUTION → DEFECT:
EXTENSION REQUIRED
(Defects raise from Workspace sessions only. Test Execution has no defect raise.)

APPLICATION BINDING:
RECONCILIATION REQUIRED
(Specification and Test Plan have no application_id. Suite/Execution Plan/Session use optional Cap project_id. Test Execution requires project_id. Phase 2 definition already uses qep_application.id.)

TENANT ISOLATION:
PASS
(RLS present on affected tables. Older spec/plan/test-execution policies are USING-only without FORCE; Core QE / Application use FORCE + WITH CHECK.)

SOURCE INDEPENDENCE:
PASS

RELEASE:
NOT CREATED
(Plan type enum includes "release"; execution-plan/defect have releaseReference strings only.)

SSH EXECUTION:
NOT AUTHORISED

TERMINAL:
NOT AUTHORISED

AI:
NOT IMPLEMENTED

PHASE 3 IMPLEMENTATION:
NOT STARTED
```

---

## 1. Existing capabilities retained

| Capability                         | Package / SoR                                                                   | Keep as                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Test Specification                 | `@apzhub/qep-test-specifications` / `qep_test_specifications`                   | Authoritative **Test Case** aggregate (product language) |
| Spec versioning / review / approve | same                                                                            | Test Case lifecycle                                      |
| Spec string preconditions          | `preconditions_json`                                                            | Screen 2 Preconditions (minimal)                         |
| Suites hierarchy / lifecycle       | `@apzhub/qep-suites` / `qep_suite`                                              | Authoritative Suite                                      |
| Test Plan (frozen)                 | `@apzhub/qep-test-plans` / `qep_test_plans` + items                             | Customer **Test Plan** (extend, do not replace)          |
| Execution Plan                     | `@apzhub/qep-execution-plans` / `qep_execution_plan`                            | Internal suite-run intent + Cap C handoff                |
| Formal execution                   | `@apzhub/qep-test-execution`                                                    | Case/step execution + sealed manifest                    |
| Execution workspace                | `@apzhub/qep-execution-workspace`                                               | Suite session execution + defect origin                  |
| Evidence                           | `@apzhub/qep-evidence`                                                          | Sole evidence SoR                                        |
| Defects                            | `@apzhub/qep-defects`                                                           | Sole defect SoR; lifecycle unchanged                     |
| Automation providers / runs        | `@apzhub/qep-automation` + `qep_automation_execution`                           | Tool resolution                                          |
| Application / env / targets        | `@apzhub/qep-applications`                                                      | Plan strategy references                                 |
| AC / Story / coverage              | `@apzhub/qep-definition`                                                        | AC SoR; coverage ≠ result                                |
| Traceability engine                | `@apzhub/qep-traceability`                                                      | Extend endpoints; no second engine                       |
| IAM                                | existing `qep.specification.*` / `qep.suites.*` / `qep.plan.*` / execution keys | No nine-role model                                       |
| Audit                              | existing spec/plan/execution/requirement audit                                  | No new audit store                                       |

---

## 2. Specification → Test Case (sections 2, 6–8)

**Classification: EXTEND** (Owner A/B/C/D: **B — extend with compatibility adapter**).

Structurally safe to extend. The aggregate already is the verification-definition SoR. Product UI already labels the sidebar “Test Cases” and home “Create Test Case” while APIs remain `/api/v1/qep/specifications`.

**Do not** create `qep_test_case`.

### Inventory (summary)

- Tables: `qep_test_specifications`, `_versions`, `_relationships`, `_history`
- Human id: free-text `number` (≤64), conventionally `TS-*`, **not regex-enforced**; uniqueness is per `(tenant, number, version_label)` lineage, not a single unique `(tenant, number)`
- Opaque id: `tsp_*`
- Lifecycle: `draft | under_review | approved | rejected | withdrawn | superseded | cancelled | retired`
- Types: includes Functional, API, Accessibility, Security, Performance, Usability (and more)
- **No `application_id` / `project_id`**
- Preconditions / postconditions / AC: `string[]` only
- **No definition steps**
- Relationships: requirement, trace_link, verification, test_case, test_suite, execution, evidence, external_reference (reference-only)
- APIs: `/api/v1/qep/specifications`
- UI: `/workspace/qep/test-specifications`
- Permissions: `qep.specification.*`

### Type vocabulary — one set

Use **existing `SPECIFICATION_TYPES`**. Screen visuals (Functional, API, Accessibility, Security, Performance, Usability) are a **subset**. Extra existing types (regression, integration, load, …) remain valid; present them; do not add a second enum.

### Lifecycle mapping (presentation, not a new machine)

| Product    | Existing                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Draft      | `draft`                                                                                                             |
| In Review  | `under_review`                                                                                                      |
| Approved   | `approved`                                                                                                          |
| Deprecated | `retired` and/or `withdrawn` (presentation alias; do not invent `deprecated` unless Owner wants one additive state) |

Keep `rejected | superseded | cancelled` as real states; they simply do not appear as Library tab labels.

### Human-readable Test Case key

**Recommendation:** Keep `Specification.number` durable (historical `TS-*`). Users see a **Test Case**. Do not renumber.

If Owner requires visual `TC-n`: add an **alias** unique per `(tenant_id, application_id)`, mapped 1:1, leaving `number` unchanged. That is optional, not required to extend the SoR.

---

## 3. Steps, preconditions, test data (sections 3–5, 24)

| Need                                  | Today                                                                                                          | Minimum extension                                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Ordered Action / Test Data / Expected | **Absent** on Specification. Present on **Test Execution** as `instruction` + `expectedResult` (no `testData`) | New child of Specification: `order`, `action`, `test_data_ref_or_text`, `expected_result`. **No** actual/pass/fail/evidence on definition |
| Preconditions                         | `string[]`                                                                                                     | **Reuse** for Phase 3 unless Owner needs addressable ids; do not build a prerequisite engine                                              |
| Test data values/secrets              | **No** QEP dataset package                                                                                     | Step holds **description/reference** only. Secrets stay in credential/vault refs used at execution                                        |

Execution already snapshots `instruction` + `expectedResult` into `qep_test_execution_manifest`. Extend the snapshot with `testData` once definition steps exist. Do not treat Workspace placeholder titles (`step-1`…`step-5`) as definition steps.

---

## 4. AC → Test Case → Execution / Evidence / Defect (9, 14, 27–29)

**Today**

- Phase 2: `qep_acceptance_criterion_verification` with `asset_kind = test_specification` only; `latest_result` optional `pass|fail|blocked`
- Coverage derived in `@apzhub/qep-definition` (Covered ≠ Pass)
- Trace kinds include `test_specification` and unused `test_case`; **no** `acceptance_criterion`
- Test Execution links to spec (+ optional plan); Evidence refs on TE and Workspace
- Defects: `createFromExecution` **Workspace only**; relationship kinds include `requirement_future` placeholder, not AC/spec

**Minimum**

1. Keep verification table; treat Specification id as Test Case id.
2. Optionally add `acceptance_criterion` to `TRACE_ENDPOINT_KINDS` and one normative type AC→specification (do not duplicate the definition table as a second SoR).
3. Derive AC latest result from Test Execution outcomes when a real join exists (stop storing a competing mutable result if execution is authoritative).
4. Allow defect raise from Test Execution as well as Workspace, or copy TE origin into the existing defect `ExecutionOrigin` shape — **one** Defect SoR.

---

## 5. Suites (10–12)

**Reuse + extend.** `@apzhub/qep-suites` is first-class. Comment in domain: _“Test Cases are out of scope.”_ No membership table. Hierarchy only (`parent_suite_id`). Optional Cap `project_id`; free-text `application` label — **not** `qep_application` FK. Lifecycle already richer than the visual (includes `published`, `archived`, `retired`, `deleted`). Kinds are `standard|shared|reusable|template|reference`, not Functional/API — map visual “Type” to existing `category` / tags / a **single** presentation field; do not clone Specification types onto Suites unless Owner wants Suite classification = Test Case type (not recommended).

**Membership (required):**  
`suite_id` → `specification_id` (+ optional `sequence`, `required|optional`, `enabled`). Current membership ≠ execution scope.

**Suite key:** introduce `SUITE-n` (or `QS-n`) unique per tenant+application. **Do not** use `TS-*`. Visual `TS-001` is not authoritative.

**History:** current membership table is enough. Historical integrity lives on **Execution snapshots**, not by rewriting suite rows.

---

## 6. Test Plan vs Execution Plan (13–16, 26, 30)

These are **not** the same object.

|                  | Test Plan (`qep-test-plans` **frozen 1.0**)                              | Execution Plan (Cap B)                                        |
| ---------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Customer meaning | Which **specifications** are in a governed plan                          | WHEN/WHERE/HOW/BY WHOM a **suite** will run; does not execute |
| Membership       | Required `specificationId`; `testCaseId` **rejected in v1**; version pin | Required `suiteRef` + filters; no spec/case ids               |
| Human key        | `number` unique per tenant                                               | none                                                          |
| Environment      | none                                                                     | label `environmentReferences[]`                               |
| Application      | none                                                                     | optional `project_id`                                         |
| Handoff          | status `in_execution`                                                    | `handed_off` + `handoffId` → Workspace                        |
| APIs             | `/api/v1/qep/plans`                                                      | `/api/v1/qep/execution-plans`                                 |

**Recommended future role (OPTION A for customers):**

```text
Customer:     Test Plan
                 ├── included Suites / Test Cases
                 └── Execution Strategy groups
Internal:     Execution Plan   (optional realisation of a Suite-scoped strategy group)
                 └── handoff → Execution Workspace
Also:         Test Execution   (case/step run, spec manifest seal)
```

Do **not** present Execution Plan as a second “Plan” in the Screen 4 IA. Do **not** delete the Cap B aggregate.

**Strategy groups (new on Test Plan):** method, capability, environmentId (1E), executionTargetId (1E), data source kind, owner. Configured tool is resolution of capability via automation mapping — not a Plan type.

**Plan lifecycle:** map visual Planned / Not Started / In Progress / Completed onto existing `draft|review|approved|ready|in_execution|completed|…`. Do not add a competing enum.

**Progress:** `GET …/executions/progress/by-plan/{planId}` already exists. Derive bars from execution counts. No typed %.

**Release/Cycle column:** GAP / omit / show `scope_label` as legacy string only.

---

## 7. Automation, capability vs tool (17–19)

- Providers already: `playwright | vitest | selenium | cypress | appium | rest | k6 | visual | accessibility | security | codequality | junit | allure | ci`
- Mappings: **JSON file ledger**, not Postgres; target kinds `suite | spec | script | url | custom`
- No `qep_automation_asset` table

**Recommended:** product **capability** catalogue (stable): Browser Automation, API Verification, Accessibility, SAST, DAST, Performance, Manual Verification, …  
Configured **implementation** = existing provider id (Playwright, k6, …). Visual tool names are examples.

On Test Case: `manual_capable` + optional mapping ids (compatibility).  
On Plan strategy: which capability/mapping to **use this time**.

---

## 8. Environment, target, SSH (20–22)

**Environment:** `qep_application_environment` — categories `development|test|staging|production|custom`. Reuse. Bind Plan strategy `environment_id` → that table. No second catalogue.

**Execution target:** `qep_application_execution_target` types **`ci_pipeline | managed_runner | remote_host`**. Visual Web / API / Repository / Remote Host is a **different taxonomy**. **Owner decision:** map (e.g. Web→managed_runner, Repository→ci_pipeline) **or** add 1E types. Do not create a Plan-local target store.

**SSH:** Remote Host config may include `host`, `port` (UI default 22), `credentialRef`, `workingRoot`. **No SSH runtime.** Phase 3 must not add one.

---

## 9. Dual execution, snapshots, results (23–26)

Keep **both**.

|                | Test Execution                         | Execution Workspace                              |
| -------------- | -------------------------------------- | ------------------------------------------------ |
| Why it exists  | Formal spec-step run, review, ingest   | Cap B suite session, immutable complete, defects |
| Step snapshot  | Yes (`instruction`, `expected_result`) | No (placeholder titles)                          |
| Suite snapshot | No                                     | `suiteId` + `suiteVersion` (members missing)     |
| Defects        | No                                     | Yes                                              |
| Result enums   | `passed                                | failed                                           | blocked | skipped | not_applicable | inconclusive | not_executed | cancelled` | `pass | fail | block | skip | not_applicable | deferred | not_executed` |

Map product Not Run / Pass / Fail / Blocked / Skipped onto **Test Execution** outcomes for case runs; map Workspace similarly in the UI. Do not invent a third enum.

---

## 10. Application binding (31)

| Object                   | Binding today                                | Phase 3 need                                                                                                       |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Requirement / Story / AC | `application_id`                             | keep                                                                                                               |
| Specification            | none                                         | add `application_id` for **new** rows; legacy Unbound until mapped via `qep_application_legacy_ref` — do not guess |
| Suite                    | optional `project_id` + string `application` | resolve new rows to `qep_application`; keep unresolved honest                                                      |
| Test Plan                | none                                         | same as Specification                                                                                              |
| Execution Plan / Session | optional `project_id`                        | same                                                                                                               |
| Test Execution           | **required** `project_id`                    | resolve via legacy_ref; do not invent                                                                              |

---

## 11. IAM, tenant, Source, AI (33–36)

- Permissions already cover spec/suite/plan/execution/automation. Application env/targets use `qep.portfolio.*` + `qep.application:{id}`. **No nine roles.**
- RLS on all listed SoRs. Tighten FORCE on older spec/plan/TE policies when implementation is authorised (hardening, not a new model).
- QEP spec/suite/plan **do not** imply `source.read` / `source.write`.
- Same aggregates can later hold AI proposals via existing origin/review patterns (Phase 2 `ai_accepted` on definition). No AI store.

---

## 12. Visual → domain matrix

### Screen 1 — Test Case Library

| UI                                                   | Authority                              | Status                                   |
| ---------------------------------------------------- | -------------------------------------- | ---------------------------------------- |
| Application selector                                 | `qep_application`                      | existing (1E)                            |
| Table ID                                             | `specification.number`                 | existing; TC- alias GAP / Owner          |
| Title / summary                                      | `title` / `description` or `objective` | existing                                 |
| Type / Priority / Status                             | spec type / priority / status          | existing + presentation aliases          |
| Automation                                           | mapping availability                   | GAP (ledger, not spec FK)                |
| Owner / Updated / Tags                               | `owner` / `updatedAt` / `tags`         | existing                                 |
| Tabs All/My/By Status/Type/Tag                       | filters on same SoR                    | extend list API (applicationId required) |
| Overview counts / top types / tags                   | derived aggregation                    | GAP (honest empty until query exists)    |
| Inspector Details / Preconditions / Steps / Expected | spec fields + **new steps**            | preconditions existing; steps GAP        |
| Pagination                                           | list API page                          | existing pattern                         |
| Sample TC-101 / 248                                  | —                                      | **do not seed**                          |

### Screen 2 — Test Case Designer

| UI                                        | Authority                               | Status                                          |
| ----------------------------------------- | --------------------------------------- | ----------------------------------------------- |
| Identity / lifecycle / tags / version     | Specification                           | existing                                        |
| Preconditions tab                         | `preconditions[]`                       | existing                                        |
| Test Data tab                             | —                                       | GAP (use step.testData + optional notes)        |
| Steps table Action / Test Data / Expected | definition steps                        | **extension**                                   |
| Expected Results tab                      | same step.expectedResult                | extension                                       |
| Verifies AC                               | `qep_acceptance_criterion_verification` | existing; join UX                               |
| Used By Suites / Plans                    | membership reverse lookup               | GAP until membership + plan items include spec  |
| Test Suite field                          | Suite membership                        | GAP                                             |
| Execution Method / Environment / Target   | **not SoR on Case**                     | show capability / mapping / latest context only |
| Test Case Health                          | derived completeness                    | GAP (compute, do not persist score)             |
| Last Result                               | Test Execution latest for spec          | extension (join)                                |
| Attachments                               | Evidence relationships kind `evidence`  | existing refs; catalogue UX D                   |
| History                                   | spec history                            | existing                                        |
| Reviewers                                 | `reviewer` single field                 | partial vs visual multi-reviewer                |
| Sample Playwright / QA / Chrome           | Plan strategy                           | **not on Case**                                 |

### Screen 3 — Test Suites

| UI                                    | Authority                 | Status                              |
| ------------------------------------- | ------------------------- | ----------------------------------- |
| Suite list / lifecycle / owner / tags | `qep_suite`               | existing                            |
| ID SUITE-n                            | new operator key          | **extension** (visual TS- not used) |
| Type Functional/API                   | Suite kinds ≠ those types | GAP / map to category or omit       |
| Test Case count                       | membership                | **extension**                       |
| Overview                              | derived                   | GAP                                 |
| Suite detail → member TCs             | membership                | **extension**                       |
| Nested folders                        | `parent_suite_id`         | existing; may hide if UX is flat    |
| Sample TS-001 / counts                | —                         | **do not seed**                     |

### Screen 4 — Test Plans / Execution Strategy

| UI                              | Authority                                   | Status                                        |
| ------------------------------- | ------------------------------------------- | --------------------------------------------- |
| Plan list ID/name/owner/updated | Test Plan `number` / title / owner          | existing                                      |
| Type                            | `PLAN_TYPES` (release/product/regression/…) | existing; visual Smoke/Audit need map or omit |
| Environment                     | 1E environment                              | **extension** (not on Test Plan today)        |
| Status                          | plan statuses                               | presentation map                              |
| Progress                        | `progress/by-plan` + executions             | extend derivation; no typed %                 |
| Execution window                | `plannedStart` / `plannedEnd`               | existing                                      |
| Release / Cycle                 | no Release SoR                              | **GAP — omit or legacy string**               |
| By Release tab                  | —                                           | unavailable until Release exists              |
| Execution Strategy table        | new Plan strategy groups                    | **extension**                                 |
| Capability / tool               | capability + provider mapping               | extension; tools not IA                       |
| Execution Target                | 1E targets                                  | extension + taxonomy Owner decision           |
| Data source                     | —                                           | GAP (enum/reference, no secrets)              |
| Included Suites                 | plan items today specs only                 | **extension**                                 |
| Executions tab                  | TE + Workspace                              | both exist; join by plan/handoff              |
| Overview / donut                | derived                                     | GAP if no aggregation                         |
| Sample TP-001 / v1.4.0 / 65%    | —                                           | **do not seed**                               |

---

## 13. Minimal schema extensions **proposed** (not created)

1. `qep_test_specifications.application_id` (nullable for legacy Unbound)
2. `qep_test_specification_step` (order, action, test_data, expected_result)
3. Optional `operator_alias` TC-n if Owner accepts
4. `qep_suite.application_id` + `suite_key` (`SUITE-n`)
5. `qep_suite_item` (suite_id, specification_id, sequence, required/optional, enabled)
6. Test Plan: `application_id`; plan item allow `suite_id` **or** `specification_id`; `qep_test_plan_strategy_group` (capability, method, environment_id, target_id, data_source_kind, mapping_id)
7. Durable automation mapping rows keyed by specification_id + capability + provider (replace JSON ledger as SoR)
8. Trace: add `acceptance_criterion` endpoint kind **or** keep definition table as AC→Case SoR and only join TE for results
9. Defect origin from Test Execution (additive), not a new defect product
10. Manifest snapshot field `test_data` on TE steps
11. Suite membership list copied onto Workspace/TE scope snapshot at run create

**Not proposed:** `qep_test_case`, second suite store, Release entity, SSH, third execution engine, AI tables, second environment/target/evidence/defect stores.

---

## 14. Compatibility / migration (would-require — not run)

| Existing                        | Change                            | Data migration?                                 | Compatibility                                                                  | Risk                                                |
| ------------------------------- | --------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `qep_test_specifications`       | additive columns + steps          | No backfill of steps; Unbound apps stay Unbound | Keep `/specifications` API; product alias Test Case                            | Low–med (frozen certified domain)                   |
| Spec `number` TS-*              | unchanged                         | No                                              | High                                                                           | Renumbering would be high — **don't**               |
| `qep_suite`                     | key + membership                  | Empty membership                                | Keep suite APIs                                                                | Med (Cap A “cases out of scope”)                    |
| `qep_test_plans` **FROZEN 1.0** | additive membership + strategy    | Existing items remain spec pins                 | Keep `/api/v1/qep/plans`; `testCaseId` stays unsupported — use specificationId | **High process risk** — unfreeze/extend needs Owner |
| Execution Plan                  | optional link from strategy group | No                                              | Keep Cap B APIs                                                                | Med (two plan stores remain internally)             |
| AC verification                 | still `test_specification`        | No                                              | Phase 2 coverage keeps working                                                 | Low                                                 |
| Automation mappings JSON        | promote to table                  | Optional copy                                   | Dual-read during transition                                                    | Med                                                 |
| TE `project_id` required        | resolve via legacy_ref            | No guessed binds                                | Unbound executions stay honest                                                 | Med                                                 |
| Dual result enums               | presentation map                  | No                                              | Two engines remain                                                             | Med UX                                              |

---

## 15. API impact (not implemented)

| API                                                | Action                                                                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `/api/v1/qep/specifications`                       | **Retain + extend** (steps, applicationId, list filters). Product may later alias `/test-cases` as adapter. |
| `/api/v1/qep/suites`                               | **Retain + extend** membership                                                                              |
| `/api/v1/qep/plans`                                | **Retain + extend** strategy + suite items                                                                  |
| `/api/v1/qep/execution-plans`                      | **Retain** internal/operational                                                                             |
| `/api/v1/qep/executions`                           | **Retain**; join latest result to Case                                                                      |
| `/api/v1/qep/execution-sessions`                   | **Retain**                                                                                                  |
| `/api/v1/qep/acceptance-criteria/.../verification` | **Retain**                                                                                                  |
| `/api/v1/qep/automation/mappings`                  | **Extend** to specification_id + capability                                                                 |
| New parallel `/test-cases` SoR                     | **Do not add** except as alias                                                                              |

---

## 16. Risks

1. **Frozen Test Plans 1.0** — Screen 4 needs the most change on a certified package.
2. **Two customer “plans” in the repo** — UX must hide Execution Plan as a duplicate IA item.
3. **Two execution engines** — Plan → Executions tab will confuse if both dump untyped.
4. **Suite membership is a green-field relation** on an otherwise mature Suite SoR.
5. **Specification has no application binding** — Library cannot be honest per Application until this exists.
6. **1E target types ≠ visual Web/API/Repository**.
7. **Automation mappings are not durable SoR**.
8. **Defects do not originate from Test Execution**.
9. Unfreezing certified domains without skipping lifecycle (015).

---

## 17. Recommended Phase 3 implementation inventory

_Not authorised. Ordered for a future instruction._

1. Bind Specification + Test Plan + new Suite rows to `qep_application` (legacy Unbound honest).
2. Definition steps on Specification; TE manifest snapshots them.
3. Product language adapter: Test Case UI / docs; keep specification APIs.
4. Suite `SUITE-n` + membership → specification.
5. Extend Test Plan: suite-or-spec items + strategy groups → 1E env/target + capability.
6. Keep Execution Plan as orchestration behind Suite-scoped strategy (handoff).
7. AC verification remains spec id; join TE for latest result; optional trace endpoint.
8. Durable automation mapping on specification; Plan strategy selects it.
9. Plan progress from existing execution progress API.
10. Defect raise from Test Execution without a second defect model.
11. Replace old spec/suite/plan workbench chrome with Screens 1–4 **after** domain/API exist.
12. No Release, SSH, Terminal, Source write, AI, parallel Test Case table.

---

## 18. Owner decisions required before implementation

These are real forks. Everything else can proceed from repository truth + already-locked visuals.

1. **Test Case operator id:** keep showing `TS-*` vs add `TC-n` alias (no renumber).
2. **Suite operator prefix:** confirm `SUITE-n` (vs `QS-n`).
3. **Unfreeze / additively extend certified Test Plans 1.0** for strategy + suite membership (recommended) vs a new Plan aggregate (**not** recommended).
4. **Execution Plan:** confirm Option A (internal orchestration, not a second IA “Plan”).
5. **Plan → Executions tab:** show Test Execution, Workspace, or both (typed).
6. **Execution target taxonomy:** map visual Web/API/Repository onto `ci_pipeline|managed_runner|remote_host` vs extend 1E types.
7. **Deprecated:** alias `retired`/`withdrawn` vs one new Specification status.

No extra decisions are required to stop progress. Dual execution should **not** be merged in Phase 3.

---

## Recommended authoritative model (repository-adjusted)

```text
qep_application
      │
      ├── Requirement
      │      ├── User Story
      │      └── Acceptance Criterion ──verification──► Specification (Test Case)
      │
      ├── Specification  [product: Test Case]
      │      ├── steps (action / test data / expected)
      │      └── automation mapping (capability → provider)
      │
      ├── Suite
      │      └── membership → Specification
      │
      └── Test Plan
             ├── items → Suite and/or Specification
             └── Execution Strategy groups
                    ├── 1E Environment
                    ├── 1E Execution Target
                    └── capability / mapping
                           │
                           ├── Test Execution (case/step, sealed manifest)
                           └── Execution Plan (suite intent) → Workspace session
                                    │
                           Result / Evidence / Defect
```

Repository truth wins over a single “Execution” box: **two execution aggregates remain**.

---

PHASE 3 IMPLEMENTATION: **NOT STARTED**

STOP FOR OWNER REVIEW.
