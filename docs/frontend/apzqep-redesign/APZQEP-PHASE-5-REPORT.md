# APZQEP Phase 5 report — Exploratory & Experience Verification

**Date:** 2026-08-20  
**Authority:** [APZQEP-PHASE-5-IMPLEMENTATION-AUTHORITY.md](./APZQEP-PHASE-5-IMPLEMENTATION-AUTHORITY.md) · [APZQEP-PHASE-5-DOMAIN-LOCK.md](./APZQEP-PHASE-5-DOMAIN-LOCK.md) · [APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md](./APZQEP-PHASE-5-IMPLEMENTATION-INVENTORY.md)  
**Phase 6:** domain **ACCEPTED** · inventory **DRAFTED** · implementation **NOT AUTHORISED**  
**Owner acceptance:** [APZQEP-PHASE-5-ACCEPTANCE.md](./APZQEP-PHASE-5-ACCEPTANCE.md) — **ACCEPTED · CLOSED** (2026-08-20)  
**This document:** closure/certification evidence after implementing the approved P5-01–P5-16 inventory. Ratings are from live behaviour against `http://127.0.0.1:3300`, not types or empty UI.

Implementation created two workflow roots (Exploratory Session, UI/UX Verification Activity), a lightweight Experience Plan, and shared Observation / Issue / Note. It **extended** existing Evidence, Defect, Application, Environment, AuthZ, history, and optional traceability. It did **not** create `qep_ui_ux_execution`, a second Test Plan, a third execution store, a Viewport Matrix table, extra Evidence/Defect/Application/Environment stores, a generic `quality_session`, TE-observation migration, AI, SSH/Terminal, Source write, Release, or the nine-role catalogue.

Owner should still **visually inspect** [evidence/phase-5/](./evidence/phase-5/) against the four locked authority images.

---

## Owner return block

```text
PHASE 5 STATUS:
COMPLETE

P5-01:
PASS

P5-02:
PASS

P5-03:
PASS

P5-04:
PASS

P5-05:
PASS

P5-06:
PASS

P5-07:
PASS

P5-08:
PASS

P5-09:
PASS

P5-10:
PASS

P5-11:
PASS

P5-12:
PASS

P5-13:
PASS

P5-14:
PASS

P5-15:
PASS

P5-16:
PASS

EXPLORATORY SESSION:
DELIVERED — qes_ / EXS-* · charter + areas · lifecycle draft|planned|in_progress|paused|blocked|completed

EXPERIENCE PLAN:
DELIVERED — uxp_ / UXP-* · lightweight aggregate · not Test Plan

UI/UX VERIFICATION ACTIVITY:
DELIVERED — qxa_ · table qep_experience_verification_activity · not qep_ui_ux_execution

SHARED OBSERVATION:
DELIVERED — attachable to Session and Verification Activity · does not imply Defect

SHARED ISSUE:
DELIVERED — dismiss / resolve / link Defect / human promote · no auto-Defect

SHARED NOTE:
DELIVERED

EVIDENCE SOR:
PRESERVED

DEFECT SOR:
PRESERVED

TWO WORKFLOW ROOTS:
PRESERVED

SECOND TEST PLAN CREATED:
NO

THIRD EXECUTION STORE CREATED:
NO

VIEWPORT MATRIX:
DERIVED

PROGRESS:
DERIVED

TENANT ISOLATION:
PASS

APPLICATION ISOLATION:
PASS

SOURCE INDEPENDENCE:
PASS

SCREEN 1 VISUAL:
CONFORMS

SCREEN 2 VISUAL:
CONFORMS

SCREEN 3 VISUAL:
CONFORMS

SCREEN 4 VISUAL:
CONFORMS

LIGHT / DARK GEOMETRY:
MATCH

MOBILE:
PASS

PLAYWRIGHT:
PASS
```

---

## Critical chain (proven live — 2026-08-20)

Focused Playwright `testing/playwright/e2e/apzqep-phase-5-experience.spec.ts` against `http://127.0.0.1:3300`, persona `org_member`, postgres persistence:

| Step                    | Proof                                                                                                                                                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unbound create          | `POST /api/v1/qep/exploratory-sessions` without `applicationId` → **400**                                                                                                                                                                                      |
| Application isolation   | Other-application Exploratory Session list empty                                                                                                                                                                                                               |
| Exploratory Session     | `qes_` / **EXS-101** Checkout Flow Exploration; start; charter areas Cart behaviour / Address validation                                                                                                                                                       |
| Shared capture          | Observation “Cart icon unclear”; Issue “Checkout confusion”; Note; Evidence capture then `/api/v1/qep/quality-evidence`                                                                                                                                        |
| Issue → Defect          | Human `promote_defect` → existing Defect SoR (`def-mt1bj097-3` in last-green UI) · Issue status **promoted**                                                                                                                                                   |
| Experience Plan         | `uxp_` / **UXP-101**; contexts Desktop + Mobile; criterion; `managed_runner` context **rejected**                                                                                                                                                              |
| Verification Activity   | `qxa_`; `verification_started` history; criterion result **verified**                                                                                                                                                                                          |
| Derived Viewport Matrix | 2 cells; Desktop **verified**, Mobile **pending** after one result                                                                                                                                                                                             |
| Derived progress        | **50% (1 of 2 criteria)** on Screen 4                                                                                                                                                                                                                          |
| Screen 1                | [01 light](./evidence/phase-5/01-exploratory-sessions-desktop-light.png) [01 dark](./evidence/phase-5/01-exploratory-sessions-desktop-dark.png) [01 mobile](./evidence/phase-5/01-exploratory-sessions-mobile-light.png) — table + cards, not a squeezed table |
| Screen 2                | [02](./evidence/phase-5/02-exploratory-workspace-desktop-light.png)–[02 dark](./evidence/phase-5/02-exploratory-workspace-desktop-dark.png) [02 mobile](./evidence/phase-5/02-exploratory-workspace-mobile-light.png) — real history, charter, capture         |
| Screen 3                | [03](./evidence/phase-5/03-ui-ux-plans-desktop-light.png)–[03 mobile](./evidence/phase-5/03-ui-ux-plans-mobile-light.png)                                                                                                                                      |
| Screen 4                | [04](./evidence/phase-5/04-ui-ux-workspace-desktop-light.png) Pause/Complete, live activity, derived matrix/progress, quick capture                                                                                                                            |

Last-green Playwright: **1 passed (5.4m)** on 2026-08-20.

---

## 1. Migrations / schema

- `packages/config/src/db/qep-experience-schema.ts`
- `packages/config/drizzle/0157_apz_qep_phase5_experience.sql`
- `packages/config/drizzle/0158_apz_qep_phase5_experience_rls.sql` — tenant RLS `app.tenant_id`
- Journal idx **157–158**

New tables (Experience SoR only; Evidence/Defect stores were not duplicated):

- `qep_exploratory_session`, `qep_exploratory_area`, `qep_exploratory_session_history`
- `qep_experience_plan`, `qep_experience_plan_discipline`, `qep_experience_context`, `qep_experience_criterion`, `qep_experience_plan_history`
- `qep_experience_verification_activity`, `qep_experience_criterion_result`, `qep_experience_context_activity`, `qep_experience_activity_history`
- `qep_quality_observation`, `qep_quality_issue`, `qep_quality_note`
- `qep_quality_evidence_link` — **relationship table**, not a second Evidence store (postgres also writes existing `qep_evidence_relationship`)
- `qep_quality_trace_link` — optional traces only

Key counters reuse `qep_definition_key_counter` kinds `exploratory_session | experience_plan | experience_activity`.

Device class is `desktop | tablet | mobile`. Mapping those values to `ci_pipeline | managed_runner | remote_host` is rejected.

Criterion results: `not_verified | partially_verified | verified` + `concernFound`. Not TE Passed/Failed/Blocked/Not Run.

---

## 2. Packages / services

New package `@apzhub/qep-experience` (`packages/qep-experience/`). Client may import `/domain` and `/presentation` only — never the package root (postgres).

Wired in `apps/web/package.json` and `apps/web/tsconfig.json` path aliases.

AuthZ (`packages/qep-contracts/src/experience.ts`):

- `qep.exploratory.read|manage|perform`
- `qep.experience.read|manage|perform`

Reader nav keys include the `.read` permissions so entitled users see **Exploratory Sessions** and **UI / UX Plans**.

---

## 3. APIs created

| Method    | Path                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------ |
| GET/POST  | `/api/v1/qep/exploratory-sessions`                                                               |
| GET/PATCH | `/api/v1/qep/exploratory-sessions/[sessionId]`                                                   |
| POST      | `.../actions` (`start\|pause\|resume\|complete\|block\|add_area\|explore_area`)                  |
| GET/POST  | `/api/v1/qep/experience-plans`                                                                   |
| GET       | `/api/v1/qep/experience-plans/[planId]`                                                          |
| POST      | `.../actions` (`add_context\|add_criterion\|set_disciplines\|start`)                             |
| GET       | `/api/v1/qep/experience-activities/[activityId]`                                                 |
| POST      | `.../actions` (`pause\|resume\|complete\|activate_context\|complete_context\|record_result`)     |
| POST      | `/api/v1/qep/quality-capture`                                                                    |
| POST      | `/api/v1/qep/quality-issues/[issueId]/actions` (`dismiss\|resolve\|link_defect\|promote_defect`) |
| POST      | `/api/v1/qep/quality-evidence`                                                                   |
| POST      | `/api/v1/qep/quality-traces`                                                                     |

Promote-to-Defect passes `projectId: applicationId` into the existing Defect service. History events are past tense (`session_started`, `verification_paused`, `evidence_attached`, `criterion_recorded`).

UI routes:

- `/workspace/qep/exploratory-sessions`
- `/workspace/qep/ui-ux-plans`

`/workspace/qep/quality-journey` and `/workspace/qep/verification` were **not** wrapped as Screens 3–4.

---

## 4. Compatibility impact

- Phase 3 Test Plan / Test Case / Suite untouched.
- Phase 4 execution engines untouched.
- TE observations untouched; no migration.
- Evidence SoR and Defect SoR preserved; relationships extended only.
- Source independence: Phase 5 does not grant `source.read` / `source.write`. Source may still appear in the sidebar if the persona already has `source.read`.
- Empty application-id handlers fail fast (no hung `get("")`).
- Application selection no longer wipes `sessionStorage` while the portfolio is still loading, so mobile resize/remount keeps the selected Application.

---

## 5. Evidence paths

All under `docs/frontend/apzqep-redesign/evidence/phase-5/`:

- `01-exploratory-sessions-desktop-light.png` / `-dark.png` / `-mobile-light.png`
- `02-exploratory-workspace-desktop-light.png` / `-dark.png` / `-mobile-light.png` / `-mobile-dark.png`
- `03-ui-ux-plans-desktop-light.png` / `-dark.png` / `-mobile-light.png`
- `04-ui-ux-workspace-desktop-light.png` / `-dark.png` / `-mobile-light.png` / `-mobile-dark.png`

---

## 6. Test commands / results

```bash
pnpm exec vitest run --config vitest.config.ts \
  packages/qep-experience \
  apps/web/lib/qep/qep-application-selection.test.ts

APZQEP_CORE_QE_PERSISTENCE_MODE=postgres \
PLAYWRIGHT_BROWSERS_PATH=/home/ubuntu/.cache/ms-playwright \
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3300 \
pnpm exec playwright test --config testing/playwright/playwright.config.ts \
  testing/playwright/e2e/apzqep-phase-5-experience.spec.ts
```

- Domain unit tests: **11 passed** (`packages/qep-experience/src/experience.test.ts`) — isolation, charter/areas, shared capture, criterion vocab, two roots, Evidence relationship, no auto-Defect from Observation, Experience Plan isolation, real history.
- Application selection: **4 passed** (empty portfolio preserves stored Application).
- Playwright: **1 passed** (last-green 2026-08-20, 5.4m). API chain + Screens 1–4 desktop light/dark + mobile.

---

## 7. Genuine limitations

- Tester / owner **display names** are often empty; UI falls back to UUID (`actorName()` is not resolved to a person record).
- Header **+ Create** is platform chrome, not a Phase 5 control. Screen-local **+ New Session** / **+ New UI / UX Plan** match the lock.
- Screen 1/3 mock filter bars (Application / Tester / Environment / Date / trend %) are not reproduced; operational search + status + derived counts are.
- QEP header Application selector and theme toggle remain `hidden` below `lg` (existing shell). Mobile uses bottom nav Home / Work / Defects / More. Application selection is persisted in `sessionStorage`.
- Optional traces are available; they are never required origin.
- In-memory `evidenceExists` allows any `ev_*` id; postgres checks the real Evidence SoR.
- Defect `requirePermission` does not expand `qep.*`; Playwright `org_member` still promoted in this environment (same as prior QEP Defect behaviour).
- Locked mock sidebar “QUALITY / User Stories” is **not** shown (Phase 5 does not grant Story nav). **Source** may still appear when the persona already has `source.read`.

---

## 8. Technical debt

- `qep_quality_evidence_link` plus SoR `qep_evidence_relationship` — relationship extension, not a second store; keep both until a later cleanup is authorised.
- Plan builder remains on Screen 4 **only while no live activity exists**. Once verification has started, the live workspace is shown (Pause / Complete, history, derived matrix).
- No `service.yaml` on `@apzhub/qep-experience` (same posture as Phase 4 `@apzhub/qep-test-management`).
- Opened session/plan ids persist in `sessionStorage`; list views restore the last workspace unless the breadcrumb is used.

---

## 9. Deliberately deferred (not Phase 5)

- `qep_ui_ux_execution`, generic `quality_session`, second Test Plan, third execution store, Viewport Matrix table
- TE/QI observation migration
- UX / accessibility / quality scores, AI, pixel-diff, BrowserStack, device farm, Figma, Playwright visual comparison as product
- SSH, Terminal, Source write, Release, nine-role catalogue
- **Phase 6**

---

```text
PHASE 5 STATUS                  CLOSED · ACCEPTED

PHASE 6                         VISUAL DESIGN COMPLETE
SCREEN 1 — Quality Risk         LOCKED
SCREEN 2 — Release Readiness    LOCKED
SCREEN 3 — Quality Gates        LOCKED
SCREEN 4 — Certification / Go-No-Go LOCKED
DOMAIN RECONCILIATION           ACCEPTED
IMPLEMENTATION INVENTORY        DRAFTED FOR OWNER REVIEW
IMPLEMENTATION                  NOT AUTHORISED
PHASE 7                         NOT STARTED
```
