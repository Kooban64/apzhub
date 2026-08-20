# APZQEP Phase 6 — domain reconciliation report

**Status:** **ACCEPTED** — Owner decisions resolved 2026-08-20. Domain lock: [APZQEP-PHASE-6-DOMAIN-LOCK.md](./APZQEP-PHASE-6-DOMAIN-LOCK.md). Inventory: [APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md) (review only).  
**Date:** 2026-08-20  
**Implementation:** NOT AUTHORISED  
**Inventory:** DRAFTED FOR OWNER REVIEW  
**Phase 7:** NOT STARTED

No schemas, migrations, tables, APIs, services, UI, seed, Release, Release Candidate, Gate engine, Risk engine, Certification store, or waiver/exception store were created.

Locked visuals remain authoritative: [Screen 1](./APZQEP-PHASE-6-SCREEN-1-QUALITY-RISK.md) · [Screen 2](./APZQEP-PHASE-6-SCREEN-2-RELEASE-READINESS.md) · [Screen 3](./APZQEP-PHASE-6-SCREEN-3-QUALITY-GATES.md) · [Screen 4](./APZQEP-PHASE-6-SCREEN-4-CERTIFICATION-GO-NO-GO.md). Sequence: [APZQEP-PHASE-6-SEQUENCE.md](./APZQEP-PHASE-6-SEQUENCE.md). Phase 0 map: [APZQEP-CAPABILITY-MAP.md](./APZQEP-CAPABILITY-MAP.md).

```text
QUALITY FACTS → QUALITY RISK → GATE CONDITIONS → GATE EVALUATIONS
    → READINESS BRIEFING → HUMAN CERTIFICATION DECISION
```

These layers are not interchangeable. This report proves what already exists and the **minimum** domain change required. It does not authorise implementation.

---

## Owner return block

```text
PHASE 6 DOMAIN RECONCILIATION:
ACCEPTED

QUALITY RISK:
NEW

QUALITY RISK SOR:
file ledger apps/web/lib/qep/risk-store.ts (not a durable SoR)

QUALITY RISK SCOPE:
APPLICATION

RISK LEVEL:
STORED

RISK TREND:
DERIVED

READINESS:
COMBINATION

READINESS SCORE:
REJECT

READINESS POSTURE:
COMBINATION

RECOMMENDED POSTURE WORDING:
REPLACE WITH CURRENT READINESS POSTURE

QUALITY GATE DEFINITION:
NEW

QUALITY GATE EVALUATION:
NEW

BLOCKING / NON-BLOCKING:
Blocking = failure prevents unconditional GO unless an authorised Certification exception exists.
Non-Blocking = advisory contribution only. Failure ≠ automatic NO-GO.

GATE SET:
DEFER

GATE TEMPLATE:
DEFER

CERTIFICATION:
EXTEND

CERTIFICATION SOR:
QEP certification-runtime → table qep_qo_document
(artefact_kind decision_package, payload kind f4_certification_evaluation)
keyed by tenantId + changeEventId. Human outcome GO | NO_GO.

GO:
SUPPORTED

CONDITIONAL GO:
EXTEND

NO_GO:
SUPPORTED

DEFER:
EXTEND

CERTIFICATION IMMUTABILITY:
EXTEND

CERTIFICATION SNAPSHOT:
EXTEND

RELEASE:
NOT REQUIRED

RELEASE CANDIDATE:
NOT REQUIRED

AUTHORITATIVE DECISION CONTEXT:
Application + Environment as SCOPE
+ qep_scm_change_event (sha/tag/PR/ci_run) as SUBJECT
Environment is not on the change event — snapshot it onto Certification.
Do not create qep_release or qep_release_candidate.

EXCEPTION / WAIVER:
EXTEND

RISK ACCEPTANCE:
REUSE

EVIDENCE:
REUSE

DEFECT:
REUSE

APPLICATION:
REUSE

ENVIRONMENT:
REUSE

PHASE 5 ISSUE:
REUSE

AUDIT / HISTORY:
EXTEND

AUTHZ:
EXTEND

TENANT ISOLATION:
GAP

APPLICATION ISOLATION:
GAP

SOURCE INDEPENDENCE:
PASS

AI:
NOT IMPLEMENTED

SSH:
NOT AUTHORISED

TERMINAL:
NOT AUTHORISED
```

**NEW** means a minimum additive QEP aggregate. It does **not** mean reuse of APZ-TCMS/testing-persistence Release / Certification / Gate tables, and it does **not** mean a generic rule/workflow engine.

Tenant/application isolation **GAP** refers to the current Risk ledger and change-keyed Certification, not to `qep_application` itself (Phase 1E isolation **PASS**).

---

## Architectural conclusion (read this first)

Three existing authorities look similar to Phase 6 and **must not be merged**.

| Authority                    | Where                                                                                                                              | What it actually is                                                                                                                                    | Phase 6 use                                                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| QEP Risk ledger              | `apps/web/lib/qep/risk-store.ts`                                                                                                   | JSON file, no tenant/application, statuses `open\|mitigated\|accepted\|waived`                                                                         | **Cannot** become Screen 1 SoR by extending the file. Replace with a new durable Quality Risk aggregate. Keep module/route/permission names. |
| QEP Certification (F4)       | `apps/web/lib/qep/certification-runtime.ts` → `qep_qo_document`                                                                    | Human GO/NO_GO over SCM **change events**. Advisory READY/BLOCKED + score. Dual-authority GO. APIs: evaluate / get / decision / reproduce / by-change. | **Extend** this as Screen 4. Do not create a parallel Certification store.                                                                   |
| QEP Release Readiness module | `modules/qep-release-readiness` + `qep-release-readiness-views.tsx`                                                                | Presentation checklist over Quality Flow KPIs, APZPEN, and the Risk ledger. Manifest: **no separate SoR**.                                             | **Replace composition**, not persist a score. Snapshot at Certification.                                                                     |
| Orchestration Gates          | `packages/platform-orchestration` + F4 seed                                                                                        | Evidence-ref-present criteria on a change. Advisory. Template `release_candidate`.                                                                     | **Unsuitable** as Screen 3 Quality Gate authority. Keep as SCM-change advisory until Owner retires/bridges.                                  |
| QA Gate packs                | `apps/web/lib/qep/qa-gate.ts`                                                                                                      | Human confirm of report findings. `autoCertified: false`.                                                                                              | **Not** Quality Gates. Do not certify.                                                                                                       |
| APZ-TCMS / testing-services  | `packages/testing-persistence` certification_record, gate definitions, `ReleaseRecord`, `ReleaseCandidateRecord`, scored readiness | Separate product. Weighted `overallReadinessScore`. Permissions `certification.view`.                                                                  | **Do not reuse** as APZQEP Phase 6 SoR.                                                                                                      |

Minimum new QEP domain after Owner lock:

1. **Quality Risk** durable aggregate (application-scoped). Signal links optional and never auto-create Risk.
2. **Quality Gate definition + evaluation** bounded to known QEP facts (not a DSL).
3. **Readiness** as derived briefing + Certification-time snapshot (no score, no readiness table as SoR).
4. **Extend** existing QEP Certification decision (GO/NO_GO today) with CONDITIONAL GO / DEFER if Owner accepts, stronger freeze, Application/Environment on the decision context, and a **single** bounded exception concept for Gate/Risk acceptance at Certification.

Do **not** create: `qep_release`, `qep_release_candidate`, readiness score, Gate weighting, AI Certification, parallel Certification, duplicate Evidence/Defect/Application/Environment, four overlapping exception types, nine-role catalogue.

---

## 1. Quality Risk

### What exists

| Fact         | Evidence                                                                                                                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Storage      | JSON ledger `apps/web/.data/qep-risk/risks.json` via `qep-ledger-fs`. Cap **500**. Disabled under Vitest.                                                                                                                                                                |
| Type         | `RiskItem`: `riskId`, `title`, `severity` (`low\|medium\|high\|critical`), `status` (`open\|mitigated\|accepted\|waived`), optional `waiverNote`, `owner`, `evidenceRef`, `createdAt`, `updatedAt`, `createdBy`.                                                         |
| Identifiers  | `risk_${uuid.slice(0,8)}`. No operator key (QR-*).                                                                                                                                                                                                                       |
| Binding      | **No `tenantId`. No `applicationId`. No description. No likelihood. No derived level. No trend. No signal FKs.**                                                                                                                                                         |
| Writes       | `POST /api/v1/qep/risk` actions `create\|mitigate\|waive\|accept`. Status **mutates in place**.                                                                                                                                                                          |
| AuthZ        | Keys `qep.risk.read` / `qep.risk.operate`. Handler currently allows mutation if **either** `operate` **or** `read` is present — AuthZ gap.                                                                                                                               |
| Module       | `modules/qep-risk` → `/workspace/qep/risk`.                                                                                                                                                                                                                              |
| Service      | `services/qep/services/qep-risk/service.yaml` — **stub**, “No business implementation.”                                                                                                                                                                                  |
| Package      | **No** `packages/qep-risk`.                                                                                                                                                                                                                                              |
| History      | `appendQepAuditEvent` (`risk.created`, `risk.waive`, …) on a separate 500-event JSON audit ledger. Not a Risk revision.                                                                                                                                                  |
| Other “risk” | **Do not conflate.** APZPEN finding `risk_accepted`. `testing_risk` (requirement-linked, tenant-scoped). `platform_project_risk` (Projects delivery). Orchestration impact `riskLevel`. Event stub `qep.risk.accepted` has **no publisher**. None of these are Screen 1. |

### Verdict

The file ledger is a **manual scratch register**, not a System of Record. Extending JSON cannot provide tenant/application isolation, inspectable history, or signal relationships.

**QUALITY RISK: NEW** durable aggregate (postgres, Application-bound, tenant-enforced). Reuse the existing module id, route, and permission family as the product surface. Do not keep the file ledger “for compatibility.” Optional one-time import of existing rows is a later inventory item, not a reason to retain JSON as SoR.

**Scope:** Phase 6 should be **application-specific**. Portfolio/cross-application Risk is a later composition, not a second SoR. Owner confirmation required.

**Risk level:** human-stored severity/level. Do not auto-compute from Defect counts.

**Trend:** derived from evaluation/status history once history exists. Do not store a separate trend enum from the visual.

**Signal ≠ Risk.** Optional links to existing facts (Requirement, AC, Test Case, Execution, Defect, Evidence, Session, Observation, Issue, Experience Plan, Activity). Creating a Risk remains a human act (`+ Create Risk`). No automatic Risk from failed tests, Defects, Issues, or failed Gates.

---

## 2. Release Readiness

### What exists in QEP

- Route `/workspace/qep/release-readiness`. Permission `qep.release_readiness.read`.
- Manifest: _“Presentation only — no separate SoR.”_ Service yaml is a **stub**.
- UI (`qep-release-readiness-views.tsx`) composes:
  - Quality Flow command-centre counts (`exceptionCount`, `blockedReleaseCount`, `waitingCount`, …)
  - APZPEN security-assurance `reviewClear`
  - Risk ledger: `openRisks.length === 0` ⇒ checklist ok
- Overall label is `ready` / `blocked` from **checklist booleans**, then “Review for Certification.” Completing checks **does not certify**.

This is not Screen 2’s dimension briefing. It is an orchestration/security/risk checklist.

### What exists outside QEP (do not adopt)

`packages/testing-services/src/quality/release-readiness-service.ts` computes **dimension scores and `overallReadinessScore`**, then `suggestedReleaseStatusFromDimensions`. That is a weighted score engine on testing-persistence. **Rejected** for APZQEP Screen 2 (lock: READINESS ≠ SCORE; mock 74% not authorised).

`testing-persistence` `ReleaseReadinessRecord` is bound to TCMS `certificationRecordId`. **Not** QEP.

### Verdict

**READINESS: COMBINATION**

- **Live:** derived composition / read model over existing QEP facts + Gate evaluations + Quality Risks.
- **At Certification:** snapshot the briefing used for the decision.
- **No** persisted readiness aggregate as SoR.
- **No** readiness score.

### Dimensions (honest derivation)

| Dimension              | SOURCE                                                                         | DERIVATION                                                                                                                                                                                       | GAPS                                                                                                                                                                        | PERSISTED OR DERIVED                 |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Requirements Readiness | Phase 2 Requirements/AC + `CoverageSnapshot` (`qep-requirements-traceability`) | Counts of requirements/AC with traces; **coverage ≠ result**                                                                                                                                     | `overallCoverage` is already a **weighted** mix of suite/execution/evidence/defect coverage — **do not promote as readiness %**. No authorised “requirements ready” formula | DERIVED                              |
| Test Coverage          | Same CoverageSnapshot + AC→Specification traces                                | Whether required AC/Test Cases are linked. Coverage ≠ Execution Result                                                                                                                           | No justified overall coverage %. Cap E snapshot is per-requirement                                                                                                          | DERIVED                              |
| Execution Success      | `qep-test-execution` **Result/outcome**, not Status                            | Count of customer Executions with Result passed/failed/not_run in the decision context. Status ≠ Result. Provider runs (`qep_automation_execution`) are not customer Executions (Phase 4 freeze) | Context (which Plan/candidate) must be the same decision context as Certification                                                                                           | DERIVED                              |
| Defect Health          | `qep_defect` severity + lifecycle                                              | Open critical/blocker counts, etc. Use existing classifications only                                                                                                                             | `qep_defect` still has `projectId`, not `applicationId` — bind via Phase 1E legacy_ref; unbound rows stay honest                                                            | DERIVED                              |
| Evidence Sufficiency   | `qep_evidence` + relationships                                                 | **Count ≠ sufficiency.** A Gate/condition must state _which_ evidence is required                                                                                                                | Visual 86% is **not** authorised. No current “required evidence catalogue” for a candidate                                                                                  | DERIVED / GAP until conditions exist |
| Quality Risk Exposure  | NEW Quality Risk SoR                                                           | Counts by stored level/status. Risk ≠ automatic NO-GO                                                                                                                                            | Today’s ledger cannot isolate by Application                                                                                                                                | DERIVED after Risk NEW               |
| Phase 5 Issues         | `qep_quality_issue` (tenant + `applicationId` + host)                          | Open issue counts as **signals**. Issue ≠ Defect ≠ Risk ≠ automatic Gate failure                                                                                                                 | Any Gate using Issues must be an explicit condition                                                                                                                         | DERIVED                              |

Preserve: Coverage ≠ Result. Status ≠ Result. Observation ≠ Issue ≠ Defect ≠ Risk.

---

## 3. Readiness posture

Existing QEP postures: certification advisory **READY | BLOCKED**; readiness UI **ready | blocked**; orchestration gate **satisfied | failed | waived | …**.

No durable **AT RISK / NOT READY / INSUFFICIENT DATA**.

**Recommend** explainable derived posture for the briefing:

- **READY** — no failed Blocking Gates; no unresolved blocking Risks (once defined); required evidence present **or** insufficient-data is false
- **AT RISK** — Non-Blocking failures, open non-blocking Risks, or marginal conditions — presentation of concern, not a score
- **NOT READY** — failed Blocking Gate or unresolved blocking Risk
- **INSUFFICIENT DATA** — required facts not evaluated (maps to Gate Not Evaluated)

Posture is **derived live** for Screen 2 and **snapshotted** onto Certification. It is not Gate Result and not the Certification decision.

**Recommended Posture** wording: **REPLACE WITH CURRENT READINESS POSTURE**. The product must not “recommend” the human decision. Existing F4 copy already says advisory READY/BLOCKED and “human certification still required” — keep that discipline, drop “Recommended.”

---

## 4. Quality Gates

### Orchestration / F4 gates — semantically unsuitable for Screen 3

F4 seeds gates such as `gate_f4_automation` with criteria `{ type: "evidence_ref_present", refKey: "automation" }`. Evaluation is against **SCM change evidence refs**, not Defect/Execution/AC SoRs. Status vocabulary: `pending | satisfied | failed | waived | deferred | not_applicable | expired | cancelled`. Categories include `mandatory | advisory`. Templates include `release_candidate`. Results live on a governance decision; definitions are versioned strings (`1.0.0`). `overrideEligible` exists.

These are **inspectable evidence-presence checks for a change**, not “Open Critical Defects = 0” against `qep_defect`.

### QA Gate — not Quality Gates

`composeQaGate` is a findings checklist for a change. Tests assert packs **must not** call `recordHumanCertificationDecision`.

### APZ-TCMS certification gates — wrong SoR

`packages/testing-services` persists `CertificationGateDefinition` / `CertificationGateEvaluation` with keys including `no_critical_defects`, `coverage_threshold`, `evidence_complete`. Outcomes: `pass | fail | warning | not_applicable | unknown | pending`. Inputs are testing-persistence defects/coverage/executions, **not** QEP Phase 2–5 SoRs. Permissions `certification.view`. **Do not extend this into APZQEP Screen 3.**

### Verdict

**QUALITY GATE DEFINITION: NEW** (QEP-bounded).  
**QUALITY GATE EVALUATION: NEW** (immutable rows; definition version frozen on the evaluation).

Do **not** design a generic rule language. Prefer a **small closed set of condition kinds** that read existing QEP facts, for example:

- defect count by existing severity/lifecycle
- AC/Test Plan coverage completeness (coverage, not result)
- customer Execution result composition (Phase 4)
- required Evidence present (named requirement, not count)
- Quality Risk unresolved blocking count
- Phase 5 Issue count **only if** the condition says so
- accessibility/experience verification completed (Phase 5 activity/plan facts)

Each evaluation must answer: condition, context, facts used, observed values, why pass/fail/unevaluated, when, which definition version.

**Passed / Failed / Not Evaluated:** durable results.  
**At Risk:** do **not** treat as a fourth durable result unless Owner later defines a bounded margin condition. Until then it is a presentation of Failed-adjacent or Non-Blocking concern on the briefing.

**Blocking / Non-Blocking:** durable on the definition.

- Blocking failure ⇒ readiness **NOT READY**; Certification must not allow silent GO.
- Blocking failure **≠** automatic NO-GO.
- Override only via the bounded Certification exception (Owner decision 7), never “Ignore Gate” / “Force GO.”

**Gate Set / Template:** orchestration templates exist; TCMS has `templateKey`. Neither is QEP Screen 3 policy. **DEFER** both for Phase 6. A later named grouping of definitions is enough if needed; do not seed “Release Readiness / Security / Quality Baseline” from the mock.

**Triggers (Phase 6 only):** **on-demand** + **at Certification** (evaluate/freeze). Event-driven/scheduled later. Do not build a rules platform.

---

## 5. Existing Certification (critical)

### QEP F4 — the authority to extend

`CertificationEvaluation` in `certification-runtime.ts`:

- Identity: `evaluationId`, `tenantId`, `changeEventId`
- Advisory: `readiness: READY | BLOCKED`, **`score: number`**, `advisory: true`
- Gates: copied views from orchestration
- Evidence: `evidenceLinks` (ids/refs/notes), not a second Evidence store
- Human: `HumanCertificationDecision.outcome: "GO" | "NO_GO"`, `actorId`, `rationale` (min length 3), `decidedAt`, approval bundle ids
- Dual authority: GO requires **both** `quality_certifier` and `quality_co_approver`; any NO_GO finalises immediately
- Persistence: `qep_qo_document` (`artefact_kind` = `decision_package`, payload `kind` = `f4_certification_evaluation`). Schema has optional `project_id`; F4 persist path does **not** set Application/Environment.
- Immutability: `certification.decision_already_recorded` once `humanDecision` exists; `GET .../reproduce` is read-only after decide. Storage is still whole-document `upsert` (votes accumulate; terminal decision is API-blocked from overwrite).
- Automation/QI/system actors rejected (`certification.human_actor_required`)
- Quality Assist / MCP tests **forbid** calling `recordHumanCertificationDecision`
- Event stubs `events/qep/certification-requested|decided` — **no publishers**

HTTP: `POST/GET /api/v1/qep/certification/evaluations`, `POST .../decision`, `GET .../reproduce`, `GET .../by-change/[changeEventId]`. Handler accepts only `GO` or `NO_GO`. Docs mentioning `qep.certification.request|review|approve` are **not** in the live permission catalogue.

Routes: `/workspace/qep/certification` and `/workspace/qep/rc` (alias). Permissions: `qep.certification.read` / `qep.certification.decide`.

**This already matches Screen 4’s core law:** the product presents evidence; a human records GO/NO_GO; AI must not certify.

### Gaps versus locked Screen 4

| Screen 4 need                               | Today                                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Application + Environment + As-of           | Change-event only; no `qep_application` / environment on the evaluation                                    |
| CONDITIONAL GO, DEFER                       | Not in the outcome union                                                                                   |
| Current Readiness Posture (not Recommended) | Uses READY/BLOCKED + **score %** in summaries — score must not become product semantics                    |
| Consume Screen 3 Gate evaluations           | Consumes F4 evidence-presence gates                                                                        |
| Consume Screen 1 Risks                      | Residual risk string from impact graph, not Quality Risk SoR                                               |
| Exceptions / Waivers tab                    | Risk `waived` is a Risk status, not a Certification exception                                              |
| Decision expiry / revoke / supersede        | `expiresAt` exists on **TCMS** records, not QEP F4                                                         |
| Single decision owner                       | Dual-authority GO                                                                                          |
| Payload upsert                              | Same evaluation document is updated for votes then terminal decision — need explicit freeze of input facts |

### TCMS CertificationRecord — do not parallel-adopt

Has `releaseLabel`, `expiresAt`, `conditions`, gateEvaluationIds, recommendations. Different product, different AuthZ, different defect/coverage stores.

### Verdict

**CERTIFICATION: EXTEND** QEP F4. **Do not** create a parallel store. **Do not** switch Screen 4 onto TCMS `certification_record`.

**GO: SUPPORTED.** **NO_GO: SUPPORTED.**  
**CONDITIONAL GO: EXTEND** (durable) if Owner accepts — explicit conditions/exceptions, not a weaker badge, not automatic from At Risk.  
**DEFER: EXTEND** (durable recorded postponement). Absence of a decision is not DEFER. DEFER ≠ NO-GO ≠ NOT READY.

**Immutability: EXTEND.** Keep fail-closed “already recorded.” Do not PATCH GO → NO-GO. Add Owner-chosen supersede / re-certification / revoke as **new records**, copying the Phase 4 Rerun/Retest pattern (new object + relation), not in-place rewrite.

**Snapshot: EXTEND.** Freeze at decision: decision context, readiness posture, Gate evaluation ids/results, Risk ids + observed status/level, Evidence references (not copied blobs), Issue ids if considered, exceptions, decision, justification, actors, timestamp. Later Defect/Risk closure must not rewrite that snapshot. Pattern already exists on Phase 4 execution snapshots and F4 `reproduceCertificationEvaluation`.

---

## 6. Release / decision context

### Searched and found

| Concept                                           | Exists in QEP?          | Notes                                                                                                                                                                                                  |
| ------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `qep_release` / `qep_release_candidate`           | **No**                  | Must not be created from visuals                                                                                                                                                                       |
| `qep_application` / `qep_application_environment` | **Yes**                 | Phase 1E SoR. Reuse.                                                                                                                                                                                   |
| `qep_application_repository`                      | **Yes**                 | Binds Application → SCM repository                                                                                                                                                                     |
| `ScmChangeEvent` / `qep_scm_change_event`         | **Yes**                 | Durable table: tenant, repo, provider, `externalKey`, payload `change_json`. Fields include `sha`, `branch`, `prNumber`. Joinable to Application via `qep_application_repository`. **No environment.** |
| F4 “Release Candidate”                            | **Label + template id** | UI title `Release Candidate ${shortChangeLabel(changeEventId)}`. Identity is the **change**, not a Release aggregate                                                                                   |
| TCMS `ReleaseRecord` / `ReleaseCandidateRecord`   | Other product           | Do not import as APZQEP Release management                                                                                                                                                             |

Phase 4 domain lock already: **No Release aggregate.**

### Comparison

| Option                                                  | Stable identity                        | Historical Certification | Repeatable Gates | Cost                                                  |
| ------------------------------------------------------- | -------------------------------------- | ------------------------ | ---------------- | ----------------------------------------------------- |
| A. Application + Environment only                       | Collides over time                     | Weak                     | Weak             | Too small                                             |
| B. Application + Environment + version/build identifier | Yes if identifier is durable           | Yes                      | Yes              | Small                                                 |
| C. Application + Environment + SCM/build artefact       | Yes — `ScmChangeEvent` already is this | Yes (today’s F4)         | Yes              | Small; maps F4                                        |
| D. New Release aggregate                                | Yes                                    | Yes                      | Yes              | Large domain APZQEP does not own deploy/publish/merge |
| E. Release + Release Candidate                          | Yes                                    | Yes                      | Yes              | Largest; TCMS already has this separately             |

**Recommend C (minimum), equivalently B if the version/build id _is_ the SCM SHA/tag/run id.** Treat **Application + Environment as scope** and **`qep_scm_change_event` as the immutable subject**. Snapshot Environment onto the Certification — the change event does not carry it. Screen 4 “Release / Candidate” selector is **presentation** of that identity, not authority to create `qep_release`.

Certification ≠ deployment. Do not turn Screen 4 into release orchestration.

**RELEASE: NOT REQUIRED.**  
**RELEASE CANDIDATE: NOT REQUIRED** as an aggregate. Keep “candidate” as the **decision-context label** for Application + Environment + SCM/version identity.

Owner must confirm (decision 6).

---

## 7. Exception / waiver / risk acceptance

| Existing                                                | Role                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| Risk `accepted` / `waived` + `waiverNote`               | Risk-level acceptance **on the Risk**, not a Gate override |
| Orchestration `waived` gate status + `overrideEligible` | F4 evidence gates; not Screen 3                            |
| Approval Engine dual authority                          | Human Certification, not a waiver SoR                      |
| APZPEN risk-acceptance                                  | Different product                                          |

Do **not** create Exception + Waiver + Risk Acceptance + Gate Override as four aggregates.

**Recommend one pair:**

1. **RISK ACCEPTANCE: REUSE** Quality Risk statuses `accepted` / `waived` (on the Risk SoR, with author, reason, time).
2. **EXCEPTION / WAIVER: EXTEND** a **single bounded Certification exception** (reason, authoriser, affected Gate and/or Risk, effective period, linkage to the Certification record, immutable history). This is the only path that can make CONDITIONAL GO or a GO despite a failed Blocking Gate **if Owner allows Blocking override at all**.

No hidden checkbox. No Force GO.

---

## 8. Evidence, Risks, Issues at Certification

- **Evidence:** REUSE `qep_evidence`. Reference ids + optional version pins (`qep_evidence_version` already exists). Do not copy blobs into Certification.
- **Risks:** after NEW Risk SoR, Certification stores **references + captured status/level at decision time** (not a second Risk row). Later closure must not rewrite the snapshot.
- **Issues:** REUSE `qep_quality_issue`. Participate in Readiness as signals; in Gates only if the condition is explicit; in Certification as referenced ids + status at decision time. Never auto-Defect, auto-Risk, or auto-Gate-fail.

---

## 9. AuthZ

Existing (reuse):

- `qep.risk.read` / `qep.risk.operate`
- `qep.release_readiness.read`
- `qep.certification.read` / `qep.certification.decide`
- `qep.audit.read`

**EXTEND** (names at inventory, not invented as a nine-role catalogue):

- define / enable Gate definitions
- evaluate Gates (or fold evaluate into operate/decide with server checks)
- authorise Certification exception
- supersede/revoke Certification if Owner accepts those verbs

Server remains authoritative. Do not infer from QEP Master UX. Fix the Risk handler so **write is not granted by `qep.risk.read`**.

Quality Assist / MCP remaining forbidden from `qep.certification.decide`.

---

## 10. Tenant / application isolation

| Surface                         | Tenant                | Application                                     |
| ------------------------------- | --------------------- | ----------------------------------------------- |
| `qep_application` / environment | PASS                  | PASS                                            |
| Quality Risk ledger             | **GAP** — no tenantId | **GAP** — global list                           |
| QEP Certification               | PASS `tenantId`       | **GAP** — change-scoped, not Application-scoped |
| Phase 5 Issue                   | PASS                  | PASS `applicationId`                            |
| Evidence                        | PASS                  | projectId / grants — existing pattern           |
| Defect                          | PASS                  | projectId — bind via 1E legacy_ref              |

**TENANT ISOLATION: GAP** (Risk).  
**APPLICATION ISOLATION: GAP** (Risk + Certification context).  
New/extended writes must enforce both server-side.

**SOURCE INDEPENDENCE: PASS** — Source write remains off; SCM is read/change-event identity only.

---

## 11. History / audit

| Mechanism                             | Use                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------- |
| `qep-audit-store` JSON                | MVP trail; 500 cap; **no tenant**; **not** Certification/Risk SoR history |
| `GET /api/v1/qep/audit`               | Reuse for operational trail                                               |
| Evidence `qep_evidence_audit`         | Reuse for Evidence                                                        |
| Phase 5 plan/activity history tables  | Pattern to copy for Gate definition / Certification events                |
| F4 `reproduceCertificationEvaluation` | Pattern for decided Certification                                         |
| Phase 4 execution snapshots           | Pattern for freezing facts                                                |

**AUDIT / HISTORY: EXTEND** existing QEP patterns. Do not build a second audit product. Real events only; do not synthesize from current state.

---

## 12. Explicit rejections (repository-proven)

Do **not** recommend:

- testing-services `overallReadinessScore` or F4 `score` as product readiness/certification score
- TCMS Release / Release Candidate / certification_record as APZQEP SoR
- orchestration Gates as Screen 3 Quality Gates
- QA Gate packs as Certification
- APZPEN risk-acceptance as QEP Quality Risk
- automatic GO/NO-GO from posture, Gates, or Risk
- AI Certification (already forbidden in F4/MCP tests — keep)
- generic rule engine / workflow engine
- duplicate Evidence, Defect, Application, Environment

---

## 13. Owner decisions (finite)

**RESOLVED** 2026-08-20. Authority: [APZQEP-PHASE-6-DOMAIN-LOCK.md](./APZQEP-PHASE-6-DOMAIN-LOCK.md). Inventory drafted for review: [APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md).

Decision 7 is locked as: failed Blocking Gate **never** yields ordinary GO; progression requires a bounded Certification Exception and must be **CONDITIONAL_GO**.

Original questions remain below for audit. Recommendations are now Owner-approved; Decision 7 is approved with the CONDITIONAL_GO-only rule.

### 1. Quality Risk persistence

**QUESTION:** Can the JSON risk ledger remain the Quality Risk SoR?  
**OPTION A:** Keep/extend `risk-store.ts` JSON.  
**OPTION B:** NEW durable Application-scoped Quality Risk aggregate; retire JSON as SoR.  
**RECOMMENDATION:** **B.**  
**CONSEQUENCE:** A is not tenant- or application-safe and cannot support Screen 1 honestly.

### 2. Quality Risk scope

**QUESTION:** Application-only or also portfolio/cross-application Risk in Phase 6?  
**OPTION A:** Application-only SoR; portfolio is a later read-model.  
**OPTION B:** First-class cross-application Risk now.  
**RECOMMENDATION:** **A.**  
**CONSEQUENCE:** B creates a second isolation model before Application isolation even exists on Risk.

### 3. Screen 3 Gate authority

**QUESTION:** What becomes the Quality Gate SoR?  
**OPTION A:** Extend orchestration F4 gates with new criterion types over QEP SoRs.  
**OPTION B:** NEW bounded QEP Gate definition + evaluation; keep F4 gates as SCM-change advisory until bridged/retired.  
**OPTION C:** Reuse APZ-TCMS certification gates.  
**RECOMMENDATION:** **B.**  
**CONSEQUENCE:** A couples platform-orchestration to QEP business facts. C evaluates the wrong Defect/Execution stores.

### 4. Certification store

**QUESTION:** Where do Screen 4 decisions live?  
**OPTION A:** EXTEND QEP `certification-runtime` / documentStore evaluations.  
**OPTION B:** NEW parallel QEP Certification table and abandon F4.  
**OPTION C:** Switch to TCMS `certification_record`.  
**RECOMMENDATION:** **A.**  
**CONSEQUENCE:** B duplicates human GO/NO_GO that already exists. C is a different product.

### 5. CONDITIONAL GO and DEFER

**QUESTION:** Are they durable outcomes?  
**OPTION A:** Only GO / NO_GO (map visual CONDITIONAL GO/DEFER to notes or no-decision).  
**OPTION B:** EXTEND durable `CONDITIONAL_GO` and `DEFER`.  
**RECOMMENDATION:** **B.**  
**CONSEQUENCE:** A cannot represent Screen 4 without collapsing distinct concepts. B requires explicit Conditional Go conditions and exception linkage.

### 6. Authoritative decision context (Release)

**QUESTION:** What is “the thing” Readiness, Gates, and Certification evaluate?  
**OPTION A:** Application + Environment only.  
**OPTION B/C:** Application + Environment + SCM/version identity (`ScmChangeEvent` sha/tag/pr/ci_run or equivalent durable build id). No `qep_release`.  
**OPTION D/E:** New Release and/or Release Candidate aggregates.  
**RECOMMENDATION:** **B/C.**  
**CONSEQUENCE:** A cannot historically distinguish certifications. D/E create a Release-management domain APZQEP does not need for quality decisions; TCMS already has Release objects for a different product.

### 7. Failed Blocking Gate

**QUESTION:** May a human ever record GO / CONDITIONAL GO when a Blocking Gate failed?  
**OPTION A:** Never — only NO-GO or DEFER until the Gate passes.  
**OPTION B:** Yes, only via a bounded Certification exception (authoriser, reason, Gate, time-bound), producing CONDITIONAL GO (or GO if policy allows).  
**RECOMMENDATION:** **B** as the _mechanism if policy allows_; **do not silently allow GO**. Whether policy allows override is this decision.  
**CONSEQUENCE:** A is simpler and stricter. B is what Screen 4 Exceptions / Conditional Go imply, without four waiver types.

### 8. F4 dual authority vs Screen 4 single owner

**QUESTION:** Must GO still require certifier + co-approver?  
**OPTION A:** Keep dual-authority for terminal GO; Screen 4 shows both identities.  
**OPTION B:** Single decision-maker as in the visual; SoD becomes optional/policy.  
**RECOMMENDATION:** **A** until Owner explicitly relaxes SoD (already implemented and tested).  
**CONSEQUENCE:** B weakens existing independent-approval rules.

### 9. “Recommended Posture” wording

**QUESTION:** Keep the visual label?  
**OPTION A:** Keep “Recommended Posture.”  
**OPTION B:** “Current Readiness Posture” (advisory, never writes Certification).  
**RECOMMENDATION:** **B.**  
**CONSEQUENCE:** A implies the product recommends the human decision.

---

## 14. What is not in this report

- Implementation remains unauthorised.
- Illustrative conceptual names are not an implementation instruction.

---

```text
PHASE 6 VISUAL DESIGN:
COMPLETE

PHASE 6 DOMAIN RECONCILIATION:
ACCEPTED

OWNER DECISIONS:
RESOLVED

IMPLEMENTATION INVENTORY:
DRAFTED FOR OWNER REVIEW

PHASE 6 IMPLEMENTATION:
NOT AUTHORISED

PHASE 7:
NOT STARTED
```

**Do not implement** until Owner authorises the inventory.
