# Architecture Review — APZQEP-CERT-080A (cross-layer integration)

| Field  | Value                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Result | **PASS**                                                                                                                                   |
| Date   | 2026-07-28                                                                                                                                 |
| Scope  | Cross-layer integration only — individual layer architecture (ARCH-013, ARCH-014) already accepted and re-confirmed by CERT-060A/060B/070A |

## Baselines re-confirmed unchanged

| Baseline                                             | Status                                                   |
| ---------------------------------------------------- | -------------------------------------------------------- |
| APZQEP-ARCH-013 (Test Plans Capability Architecture) | **ACCEPTED / ARCHITECTURE BASELINED / CLOSED**           |
| APZQEP-ARCH-014 (Test Plans Workbench Architecture)  | **ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED** |

## Layer boundary integrity (Document 000 / OES-003-equivalent layering)

| Boundary                                  | Check                                                                                                                                                                                        | Result                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Domain → Infrastructure                   | Infrastructure consumes Domain aggregate/commands/policies via ports only; no lifecycle/policy reimplementation                                                                              | **PASS** — confirmed at CERT-060B; no `src/domain/` diff since         |
| Infrastructure → Presentation (Workbench) | Workbench consumes Infrastructure exclusively via `/api/v1/qep/plans/*` REST; no direct repository/DB access from `apps/web`                                                                 | **PASS** — confirmed at CERT-070A; no `src/infrastructure/` diff since |
| Presentation → Client                     | No business rules in `apps/web/components/qep/qep-test-plan-views.tsx`; action rendering derives solely from `dto.availableActions`                                                          | **PASS**                                                               |
| Module registration                       | `modules/qep-test-plans/module.yaml` — single manifest for the full capability; permissions (`qep.plan.*`) declared once, consumed by both Infrastructure authorisation and Workbench gating | **PASS**                                                               |

## Cross-layer `availableActions` contract (single source of truth)

The `availableActions` array is computed exactly once, in the Domain/Application layer (`packages/qep-test-plans/src/application/available-actions.ts`), projected unmodified onto the Plan DTO by Infrastructure's DTO adapter, transported unmodified over `/api/v1/qep/plans/*`, and consumed as the **sole** action-rendering authority by the Workbench (`apps/web/components/qep/qep-test-plan-views.tsx`, `hasAction` / `planActionVisible`). No intermediate layer was found to recompute, filter, or override this contract independently.

| Stage                                     | Verified location                                                                                                          | Result   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| Computation                               | `packages/qep-test-plans/src/application/available-actions.test.ts` (8 tests)                                              | **PASS** |
| DTO projection                            | `packages/qep-test-plans/src/application/adapters/plan-dto-adapter.test.ts` (2 tests)                                      | **PASS** |
| REST transport                            | `apps/web/lib/api/v1/handlers/qep-test-plan.test.ts` (5 tests)                                                             | **PASS** |
| Workbench rendering (positive + negative) | `apps/web/components/qep/qep-test-plan-views.test.tsx` (15 tests, incl. negative test that an absent action never renders) | **PASS** |

This chain constitutes the binding architectural invariant reaffirmed at ARCH-014 Owner Acceptance: _"The Workbench SHALL never determine what a user may do."_ It is confirmed intact end-to-end by this Capability Certification.

## No architectural drift

| Check                                                                                                                | Result                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain source (`src/domain/`) unchanged since CERT-060A                                                              | **PASS**                                                                                                                                                 |
| Infrastructure source (`src/infrastructure/`) unchanged since CERT-060B                                              | **PASS**                                                                                                                                                 |
| Presentation source (`src/presentation/`, `apps/web/components/qep/`, `apps/web/lib/qep/`) unchanged since CERT-070A | **PASS**                                                                                                                                                 |
| Package export surface (`src/index.ts`) unchanged since CERT-060B                                                    | **PASS** — `exports` map in `package.json` matches ARCH-013/014 layering (`./domain`, `./application`, `./infrastructure`, `./presentation`, `./shared`) |
| No fabricated cross-capability screens (Test Execution / Run / Evidence / Defects)                                   | **PASS** — governed unavailable by ARCH-014 §11 design, unchanged                                                                                        |

## Observation (documentation-only, non-blocking, not remediated under CERT-080A)

`packages/qep-test-plans/src/index.ts` exports `QEP_TEST_PLANS_PROGRAMME` with the stale literal value `"APZQEP-ENG-060B IMPLEMENTED AWAITING ENGINEERING COMPLETION REVIEW"`, predating ENG-060B's Owner Acceptance and the subsequent ARCH-014/OES-ENG-070A/ENG-070A/CERT-060A/CERT-060B/CERT-070A programmes. `modules/qep-test-plans/module.yaml` similarly retains `metadata.description` text mentioning "Workbench Engineering APZQEP-ENG-070A in progress" and `module.status: implemented-awaiting-engineering-completion-review`. This is the same class of finding already recorded, and deliberately left unremediated, at CERT-070A `OPERATIONAL-READINESS.md` — a manifest/constant metadata staleness, not a functional, routing, or permission defect. It is re-confirmed here as unchanged and is **not** treated as a certification-blocking finding, consistent with certification independence (no engineering under CERT-080A). It remains available for a future maintenance action.

## Verdict

Cross-layer architectural integration **PASS**. The Test Plans capability integrates Domain, Infrastructure, and Workbench without boundary violation, without duplication, and without drift from the accepted architectures.
