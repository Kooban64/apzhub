# APZQEP Phase 6 report — Quality Risk, Gates, Readiness, Certification

**Date:** 2026-08-20  
**Authority:** [APZQEP-PHASE-6-IMPLEMENTATION-AUTHORITY.md](./APZQEP-PHASE-6-IMPLEMENTATION-AUTHORITY.md) · [APZQEP-PHASE-6-DOMAIN-LOCK.md](./APZQEP-PHASE-6-DOMAIN-LOCK.md) · [APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-6-IMPLEMENTATION-INVENTORY.md)  
**Visuals:** [01](./visuals/phase-6/01-quality-risk-authority.png) · [02](./visuals/phase-6/02-release-readiness-authority.png) · [03](./visuals/phase-6/03-quality-gates-authority.png) · [04](./visuals/phase-6/04-certification-go-no-go-authority.png)  
**This document:** closure evidence after implementing the approved P6-01–P6-16 inventory. Ratings are from live behaviour against `http://127.0.0.1:3300`, not types or empty UI.  
**Owner closure pass (2026-08-20):** functional implementation and seven live proofs **ACCEPTED**. Visual PARTIAL ratings reclassified where the difference is approved domain truth. Authoritative `pnpm typecheck` completed and classified. **Phase 6 FROZEN. Phase 7 not started.**

Implementation created a **new PostgreSQL Quality Risk SoR**, **new bounded Quality Gate definition + immutable evaluation**, derived **Current Readiness Posture** (no score), and **extended existing F4 Certification** (`qep_qo_document`, payload `kind = f4_certification_evaluation`) with `GO | CONDITIONAL_GO | NO_GO | DEFER`, dual authority, Certification Exception, Blocking Gate enforcement, Environment snapshot, and SCM identity.

It did **not** create `qep_release`, `qep_release_candidate`, a parallel Certification store, a second Evidence/Defect/Application/Environment store, Gate Sets, Gate Templates, a generic rule/workflow engine, quality/readiness scores, automatic or AI Certification, SSH, Terminal, Source write, or Phase 7.

Owner should still **visually inspect** [evidence/phase-6/](./evidence/phase-6/) against the four locked authority images. Where the locked mock invented sample scores or statuses, **domain truth was preserved** and the discrepancy is recorded below.

---

## Owner return block

```text
PHASE 6 STATUS:
COMPLETE

P6-01:
PASS

P6-02:
PASS

P6-03:
PASS

P6-04:
PASS

P6-05:
PASS

P6-06:
PASS

P6-07:
PASS

P6-08:
PASS

P6-09:
PASS

P6-10:
PASS

P6-11:
PASS

P6-12:
PASS

P6-13:
PASS

P6-14:
PASS

P6-15:
PASS

P6-16:
PASS

QUALITY RISK SOR:
NEW postgres — qep_quality_risk (JSON ledger retired as SoR)

LEGACY RISK MIGRATION:
PASS — additive migrate_ledger only when bound to an application; no guessed mapping

RISK HISTORY:
PASS — qep_quality_risk_history append-only

QUALITY GATE DEFINITION:
PASS — qep_quality_gate_definition · blocking | non_blocking · closed condition set

QUALITY GATE EVALUATION:
PASS — qep_quality_gate_evaluation immutable; definition snapshot frozen

GATE EXPLAINABILITY:
PASS — observed value + reason recorded on each evaluation

BLOCKING GATE ENFORCEMENT:
PASS — no silent bypass on API, UI, service, or legacy GO/NO_GO path for Phase 6 records

READINESS SCORE:
NOT IMPLEMENTED

CURRENT READINESS POSTURE:
PASS — ready | at_risk | not_ready | insufficient_data

READINESS SNAPSHOT:
PASS — frozen onto F4 evaluation.phase6.readinessSnapshot

DECISION CONTEXT:
PASS — Application + Environment + qep_scm_change_event identity required to certify

ENVIRONMENT SNAPSHOT:
PASS — { id, name } frozen at evaluation; later env rename does not rewrite history

CERTIFICATION AUTHORITY:
EXTENDED — existing F4 qep_qo_document / f4_certification_evaluation

GO:
PASS

CONDITIONAL_GO:
PASS

NO_GO:
PASS

DEFER:
PASS

DUAL AUTHORITY:
PASS — quality_certifier + quality_co_approver, distinct actors

CERTIFICATION EXCEPTION:
PASS — qep_certification_exception; never converts failed Blocking Gate into GO

CERTIFICATION SNAPSHOT:
PASS — evaluation.phase6 frozen

CERTIFICATION HISTORY:
PASS — later Risk create did not change stored phase6 snapshot

RELEASE:
NOT CREATED

RELEASE CANDIDATE:
NOT CREATED

PARALLEL CERTIFICATION STORE:
NO

TENANT ISOLATION:
PASS

APPLICATION ISOLATION:
PASS

SOURCE INDEPENDENCE:
PASS

SCREEN 1 VISUAL:
CONFORMS WITH APPROVED DOMAIN ADAPTATIONS

SCREEN 2 VISUAL:
CONFORMS WITH APPROVED DOMAIN ADAPTATIONS

SCREEN 3 VISUAL:
CONFORMS WITH APPROVED DOMAIN ADAPTATIONS

SCREEN 4 VISUAL:
CONFORMS WITH APPROVED DOMAIN ADAPTATIONS

LIGHT / DARK GEOMETRY:
MATCH

MOBILE:
PASS

PLAYWRIGHT:
PASS — LAST GREEN 2 passed (6.1m) 2026-08-20; not re-run (no application-code change in this closure pass)

AI:
NOT IMPLEMENTED

SSH:
NOT ENABLED

TERMINAL:
NOT ENABLED

PHASE 7:
NOT STARTED
```

---

## Owner closure pass — visual re-assessment

Owner accepted the four PARTIAL ratings where the difference from the locked visual is approved domain truth. Screens were re-assessed on layout, hierarchy, information architecture, interaction composition, responsive behaviour, and light/dark geometry — not illustrative mock data or rejected product concepts. Domain was not altered to resemble the mock.

| Screen              | Structural judgement                                                                                                                                                                                 | Approved domain adaptations (not defects)                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1 Quality Risk      | Header, tabs (All / My / By Application / By Status / By Risk Level / By Domain / By Owner / Recent), search + filters, register table, summary cards; mobile list / filters / summary / detail      | SoR statuses `open \| mitigated \| accepted \| waived` instead of Identified / Investigating / … |
| 2 Release Readiness | Context bar (Application + Environment + SCM identity), Current Readiness Posture, risk exposure, gate preview, briefing lists, continue-to-Certification; mobile overview / gates / risks           | No 74% / Partially Ready; no Release / Candidate selector                                        |
| 3 Quality Gates     | Title, + Create Gate, All / Active / Evaluations / History, metric cards, definition/evaluation table; mobile list / summary / detail                                                                | Gate Sets / Templates not built; labelled out of Phase 6                                         |
| 4 Certification     | Context triple, Current Readiness Posture + gates + risks, four human outcomes, justification, dual-authority vote, decision-context snapshot, recent decision; mobile decision / snapshot / history | Current Readiness Posture instead of Recommended Posture; no Release / Candidate                 |

Light/dark geometry matches. Mobile changes composition only.

---

## Owner closure pass — typecheck

**Authoritative command:**

```bash
pnpm typecheck
```

(`package.json` → `pnpm -r --if-present run typecheck`)

**Result:** **FAIL** (exit 2). Recursive run stopped at the first failing workspace package:

`@apzhub/platform-authorization` — `authorization-seed.ts:227` (`catalogue.write` compared against an IAM union that does not include that key) and `postgres-authorization-store.ts:1035` (`AuthorizationEvaluationResult` used as a return type while only imported inside the function body).

Follow-on scoped typechecks (not substitutes for the authoritative command):

| Command                                         | Result                            |
| ----------------------------------------------- | --------------------------------- |
| `pnpm --filter @apzhub/qep-assurance typecheck` | **PASS**                          |
| `pnpm --filter @apzhub/config typecheck`        | **PASS**                          |
| `pnpm --filter @apzhub/qep-contracts typecheck` | **PASS**                          |
| `pnpm --filter @apzhub/web typecheck`           | **FAIL** — 164 errors in 95 files |

**Phase 6 created files** (`qep-phase-6-*.tsx`, `@apzhub/qep-assurance`, assurance handlers/API, schema 0159/0160) **do not appear in the error list.**

Classification of relevant failures (no `@ts-ignore`, `@ts-expect-error`, `any`, disabled checks, excluded files, or weakened tsconfig):

| Classification           | What                                                                                                                                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PHASE 6 APPLICATION**  | **None.**                                                                                                                                                                                                                                                                              |
| **PRE-EXISTING**         | `platform-authorization` IAM seed / evaluation return type; F4 RC face `certification-runtime.ts:609` (`"code_quality"` is not in `RcDomainId`); `compose-qep-sidebars.ts:321–322` (`noUncheckedIndexedAccess` on `Record<string, string>` — Quality Gates href is present in the map) |
| **UNRELATED REPOSITORY** | Commerce/marketplace/pricing, platform-admin, organisation-admin, IAM verticals, APZPEN, Time, Support, platform-email, platform-services Documents/Notification                                                                                                                       |
| **TEST/HARNESS**         | `ProcessEnv` stubs missing `NODE_ENV`; `change-quality-journey.test.ts` `Partial<CertificationEvaluation>` vs required `domains` (error dump mentions optional `phase6` only because that field was added; the incompatibility is `domains`)                                           |
| **INFRASTRUCTURE**       | Source repository route handlers vs `PlatformApiRouteHandler`; Phase 3–5 QEP dynamic-route handlers vs the same handler arity                                                                                                                                                          |

No application code was changed in this closure pass. Existing last-green Playwright and the seven live proofs remain the Phase 6 certification authority.

---

## Seven end-to-end proofs (required for COMPLETE)

Live HTTP against `http://127.0.0.1:3300`, persona `org_member` + independent `org_admin` co-approver, postgres persistence. Recorded in [evidence/phase-6/00-end-to-end-proofs.json](./evidence/phase-6/00-end-to-end-proofs.json):

| #   | Required proof                                                      | Result                                                                                           |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | Ordinary GO with satisfied Blocking Gates                           | **`GO`** after dual authority                                                                    |
| 2   | Failed Blocking Gate rejecting ordinary GO                          | **HTTP 409**                                                                                     |
| 3   | Failed Blocking Gate without exception rejecting CONDITIONAL_GO     | **HTTP 409**                                                                                     |
| 4   | Authorised exception allowing CONDITIONAL_GO                        | **`CONDITIONAL_GO`** after dual authority; subsequent GO still rejected                          |
| 5   | NO_GO                                                               | **`NO_GO`** (single authority, fail-closed)                                                      |
| 6   | DEFER                                                               | **`DEFER`** (single authority, fail-closed; distinct from NO_GO)                                 |
| 7   | Historical Certification unchanged after later quality-state change | **`historicalUnchanged: true`** — new critical Risk after GO did not rewrite `evaluation.phase6` |

Subject of the chain:

- Application `qapp-db93327c-ec70-44dc-b3da-6e3f12d3195a` (Assurance App)
- Environment `qappe-29abdf4e-5ce5-433d-81fa-6cfff1e0ba2d` (QA)
- SCM identity recorded as `qep_scm_change_event` id (`P6…-pass` / `P6…-fail`) even when no heartbeat row existed

Decision path proven:

```text
Application + Environment + SCM identity
  → Quality Facts
  → Quality Risk (human-created)
  → Gate Evaluation (immutable, explainable)
  → Current Readiness Posture
  → F4 Certification (extended in place)
```

There is no API, UI, service, or compatibility path that silently bypasses the Blocking Gate rule for Phase 6 evaluations. Legacy F4 records **without** `phase6` remain GO/NO_GO only; new historical values were not manufactured for them.

---

## Critical chain (proven live — 2026-08-20)

Focused Playwright `testing/playwright/e2e/apzqep-phase-6-assurance.spec.ts` against `http://127.0.0.1:3300`:

| Step                             | Proof                                                                   |
| -------------------------------- | ----------------------------------------------------------------------- |
| Unbound Risk                     | `POST /api/v1/qep/risk` without `applicationId` → **400**               |
| Application isolation            | Other-application Risk list **empty**                                   |
| Risk mutate AuthZ                | POST requires `qep.risk.operate` only (write-via-read corrected)        |
| Gate definition                  | Blocking `unresolved_blocking_risks eq 0`                               |
| Gate evaluation after mitigate   | **passed**                                                              |
| Ordinary GO                      | Dual vote certifier (`org_member`) + co-approver (`org_admin`) → **GO** |
| Failed Blocking Gate             | Open critical Risk → evaluation **failed**                              |
| GO prohibited                    | Decision **409**                                                        |
| CONDITIONAL_GO without exception | Decision **409**                                                        |
| Exception                        | `POST /api/v1/qep/certification/exceptions` authorised                  |
| CONDITIONAL_GO with exception    | Dual vote → **CONDITIONAL_GO**; GO remains prohibited                   |
| NO_GO / DEFER                    | Recorded as distinct terminal outcomes                                  |
| History                          | `GET` of prior GO `phase6` identical after later Risk create            |
| Screens 1–4                      | Desktop light/dark + mobile light/dark captured                         |

Last-green Playwright: **2 passed (6.1m)** on 2026-08-20.

Visual screenshots were captured on a separate empty **Assurance Visuals** application (surface geometry). The seven decision proofs used **Assurance App**. Domain-chain rows are in postgres, not in the visual-capture application.

---

## 1. Migrations / schema

- `packages/config/src/db/qep-assurance-schema.ts`
- `packages/config/drizzle/0159_apz_qep_phase6_assurance.sql`
- `packages/config/drizzle/0160_apz_qep_phase6_assurance_rls.sql` — tenant RLS `app.tenant_id`
- Journal idx **159–160**

New tables (assurance SoR only; Certification remains F4 `qep_qo_document`):

- `qep_quality_risk`, `qep_quality_risk_history`, `qep_quality_risk_signal`
- `qep_quality_gate_definition`, `qep_quality_gate_evaluation`
- `qep_certification_exception`

Key counters reuse `qep_definition_key_counter` kinds `quality_risk | quality_gate` → `QR-nnn` / `QG-nnn`.

No `qep_release` / `qep_release_candidate` table exists.

---

## 2. Packages / services

New package `@apzhub/qep-assurance` (`packages/qep-assurance/`). Client may import `/domain` and `/presentation` only — never the package root (postgres).

Policy (`src/domain/policy.ts`):

- `assertCertificationOutcomeAllowed` — Blocking Gate rule, no silent bypass
- `deriveReadinessPosture` / `composeReadinessSnapshot` — no score
- Closed Gate condition kinds: `unresolved_blocking_risks`, `open_critical_defects`, `open_quality_issues`, `failed_customer_executions`, `required_evidence_missing`

AuthZ:

- Added `qep.gate.read | qep.gate.define | qep.gate.evaluate`
- `qep.gate.read` on reader catalogue + reader nav keys
- Risk POST `/api/v1/qep/risk` requires **`qep.risk.operate` only** (was read OR operate)
- Exception authorise uses `qep.certification.decide`
- Dual GO / CONDITIONAL_GO still requires `quality_certifier` + `quality_co_approver` with distinct human actors
- `system:` / `qi:` / `automation:` actors rejected before load

---

## 3. APIs

| Method   | Path                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| GET/POST | `/api/v1/qep/risk` (`create`, `mitigate`, `accept`, `waive`, `migrate_ledger`)                             |
| GET/POST | `/api/v1/qep/quality-gates`                                                                                |
| GET      | `/api/v1/qep/quality-gates/[gateId]`                                                                       |
| POST     | `/api/v1/qep/quality-gates/[gateId]/evaluate`                                                              |
| GET      | `/api/v1/qep/quality-gates/evaluations`                                                                    |
| GET      | `/api/v1/qep/readiness?applicationId=&changeEventId=`                                                      |
| POST     | `/api/v1/qep/certification/exceptions`                                                                     |
| POST     | `/api/v1/qep/certification/evaluations` — **requires** `applicationId` + `environmentId`                   |
| POST     | `/api/v1/qep/certification/evaluations/[evaluationId]/decision` — `GO \| CONDITIONAL_GO \| NO_GO \| DEFER` |

Existing F4 GET / reproduce / by-change routes remain. Decision enforcement uses **frozen gate evaluations** on `evaluation.phase6` plus **live authorised exceptions**. Later Risk / Gate-definition changes cannot rewrite a recorded snapshot.

UI routes:

- `/workspace/qep/risk` — Screen 1
- `/workspace/qep/release-readiness` — Screen 2
- `/workspace/qep/quality-gates` — Screen 3
- `/workspace/qep/certification` — Screen 4

---

## 4. Compatibility impact

- Existing GO / NO_GO F4 records still load. Outcomes other than GO/NO_GO are rejected on records that lack `phase6`.
- Existing Evidence, Defect, Application, Environment, and SCM change-event stores were not duplicated.
- JSON risk ledger (`apps/web/lib/qep/risk-store.ts`) is readable for `migrate_ledger` only; it is not SoR.
- F4 payload may still carry a legacy `score` field internally; it is **not** product Certification or Readiness semantics and is not shown on the four screens.
- SCM identity is recorded from the supplied `changeEventId`. If no heartbeat row exists, Phase 6 still records the identity rather than inventing a Release.
- Source independence: Phase 6 does not grant `source.read` / `source.write`. Source may still appear in the sidebar if the persona already has `source.read`. SSH and Terminal were not enabled.

---

## 5. Evidence paths

All under `docs/frontend/apzqep-redesign/evidence/phase-6/`:

| File                        | What                                                |
| --------------------------- | --------------------------------------------------- |
| `00-end-to-end-proofs.json` | Seven decision proofs + application/environment ids |
| `01` / `02`                 | Quality Risk desktop light / dark                   |
| `03` / `04`                 | Quality Gates desktop light / dark                  |
| `05` / `06`                 | Release Readiness desktop light / dark              |
| `07` / `08`                 | Certification desktop light / dark                  |
| `09` / `10`                 | Quality Risk mobile light / dark                    |
| `11` / `12`                 | Quality Gates mobile light / dark                   |
| `13` / `14`                 | Release Readiness mobile light / dark               |
| `15` / `16`                 | Certification mobile light / dark                   |

(`07-end-to-end-proofs.json` is a copy of `00-end-to-end-proofs.json` from the Playwright run.)

---

## 6. Test commands / results

```bash
pnpm exec vitest run --config vitest.config.ts \
  packages/qep-assurance \
  apps/web/lib/qep/qep-permission.test.ts \
  apps/web/lib/workbench/compose-qep-sidebars.test.ts

APZQEP_CORE_QE_PERSISTENCE_MODE=postgres \
PLAYWRIGHT_BROWSERS_PATH=/home/ubuntu/.cache/ms-playwright \
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3300 \
pnpm exec playwright test --config testing/playwright/playwright.config.ts \
  testing/playwright/e2e/apzqep-phase-6-assurance.spec.ts
```

- Domain unit tests: **15 passed** (`packages/qep-assurance/src/assurance.test.ts`) — tenant/application isolation, Risk history, JSON migration, Gate definition/evaluation immutability, posture derivation, Blocking Gate rule, exception path, snapshot freeze.
- Permission / sidebar: **12 passed**.
- Playwright: **2 passed** (2026-08-20, 6.1m). API chain + Screens 1–4 desktop light/dark + mobile.

---

## 7. Visual vs domain discrepancies (preserved domain truth)

| Locked visual                                    | Product behaviour                                                                       | Closure rating             |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- | -------------------------- |
| Screen 1 statuses Identified / Investigating / … | SoR `open \| mitigated \| accepted \| waived`                                           | Approved domain adaptation |
| Screen 2 74% / “Partially Ready”                 | **Not implemented.** Current Readiness Posture                                          | Approved domain adaptation |
| Screen 3 Gate Sets / Templates                   | **Not in Phase 6.** Tab labelled as out of scope                                        | Approved domain adaptation |
| Screen 4 “Recommended Posture”                   | **Current Readiness Posture** (advisory; never auto-certifies)                          | Approved domain adaptation |
| Sample table rows on locked PNGs                 | Visual Playwright used an empty application; domain proofs used a different application | Not a visual defect        |

Light/dark changes appearance only. Desktop/mobile changes composition only (stacked cards, overview/gates/risks and decision/snapshot/history segments). Domain semantics are identical.

---

## 8. Genuine limitations

- Visual-capture screenshots show empty registers because that Playwright test created **Assurance Visuals** without seeding Risks/Gates. The seven proofs are HTTP evidence, not those screenshots.
- Header Application selector and theme toggle remain `hidden` below `lg` (existing shell). Mobile uses bottom nav Home / Work / Defects / More.
- Header **+ Create** is platform chrome, not a Phase 6 control. Screen-local **+ Create Risk** / **+ Create Gate** / **Start Certification** are the product actions.
- SCM identity may be a caller-supplied change-event id without a corresponding heartbeat row.
- In-memory assurance repository is for unit tests; live path is postgres (`APZQEP_CORE_QE_PERSISTENCE_MODE=postgres`).
- No `service.yaml` on `@apzhub/qep-assurance` (same posture as Phase 4/5 packages).

---

## 9. Technical debt

- F4 document payload still includes legacy score/RC face fields required for compatibility; UI must continue to ignore them as product semantics.
- JSON ledger file remains on disk for additive migration; it must not be re-used as SoR.
- Gate evaluation rows are immutable inserts; definition updates increment `version` and freeze the prior snapshot onto historical evaluations.
- Certification Exception is bound to a specific gate evaluation + environment + change identity. It cannot be reused as a standing waiver.

---

## 10. Deliberately deferred (not Phase 6)

- `qep_release`, `qep_release_candidate`
- Parallel Certification store; second Evidence / Defect / Application / Environment store
- Gate Sets, Gate Templates, generic rule engine, generic workflow engine
- Quality score, readiness score, Gate weighting
- Automatic GO / CONDITIONAL_GO / NO_GO / DEFER
- AI recommendation or AI Certification
- SSH, Terminal, Source write
- **Phase 7**

---

```text
PHASE 6 OWNER CLOSURE           PASS
PHASE 6 STATUS                  COMPLETE · FROZEN

SCREEN 1 — Quality Risk         CONFORMS WITH APPROVED DOMAIN ADAPTATIONS
SCREEN 2 — Release Readiness    CONFORMS WITH APPROVED DOMAIN ADAPTATIONS
SCREEN 3 — Quality Gates        CONFORMS WITH APPROVED DOMAIN ADAPTATIONS
SCREEN 4 — Certification        CONFORMS WITH APPROVED DOMAIN ADAPTATIONS

TYPECHECK                       FAIL WITH CLASSIFICATION — no Phase 6 introduced error
PLAYWRIGHT                      PASS — LAST GREEN 2 passed (6.1m) 2026-08-20
SEVEN LIVE CERTIFICATION PROOFS PASS — 00-end-to-end-proofs.json remains authority

DOMAIN RECONCILIATION           ACCEPTED
DOMAIN LOCK                     RECORDED
IMPLEMENTATION INVENTORY        APPROVED
PHASE 6 IMPLEMENTATION          CLOSED · ACCEPTED
PHASE 7                         AI QUALITY COMPANION · NOT STARTED
```
