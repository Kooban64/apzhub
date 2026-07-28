# Workbench Component Certification Report — APZQEP-CERT-070A

| Field | Value |
| ----- | ----- |
| Programme | **APZQEP-CERT-070A** |
| Component | Test Plans Workbench (presentation layer) |
| Package | `@apzhub/qep-test-plans` **0.2.0** |
| Status | **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION** |
| Recommended class | **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS** |
| Date | 2026-07-28 |
| Evidence | `20260728T073000Z-APZQEP-CERT-070A.json` |

## Certification statement (assurance)

The Test Plans Workbench, as Owner-Accepted under **APZQEP-ENG-070A** (2026-07-28), is suitable for production use **within its defined presentation scope**, subject to the recorded, Owner-acknowledged limitations. The Workbench renders state supplied by the certified Infrastructure and executes only actions explicitly authorised through the `availableActions` contract — it does not define business rules, and it does not duplicate Domain or Infrastructure behaviour.

## Baselines assessed

| Baseline | Status |
| -------- | ------ |
| APZQEP-ARCH-014 (Test Plans Workbench Architecture) | **ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED** |
| APZQEP-OES-ENG-070A (Test Plans Workbench Engineering Specification) | **ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED** |
| APZQEP-CERT-060A (Domain 0.1.0) | **CERTIFIED / APPROVED / CLOSED** |
| APZQEP-CERT-060B (Infrastructure 0.2.0) | **CERTIFIED / APPROVED / CLOSED** |
| APZQEP-ENG-070A (Test Plans Workbench Engineering) | **ACCEPTED / APPROVED / PROGRAMME CLOSED** (2026-07-28) |

## Surface assessed (ARCH-014 fidelity)

| Surface | Status |
| ------- | ------ |
| Module registration & Sidebar IA | **CONFIRMED PRESENT** — `modules/qep-test-plans/module.yaml`, permission-gated |
| Dashboard, Explorer, Review queue, Search | **CONFIRMED PRESENT** |
| Inspector — Summary, Metadata, Items, Relationships, History, Versions | **CONFIRMED PRESENT** |
| Create / Edit Draft | **CONFIRMED PRESENT** |
| Action Bar — all 19 catalogued actions, `availableActions`-gated | **CONFIRMED PRESENT** |
| Structural dialogs — `updateMetadata`, `transferOwnership`, `updateAssignment`, `updateSchedule` | **CONFIRMED PRESENT AND WIRED** |
| Compare — governed unavailable slot (L-01) | **CONFIRMED PRESENT** — live route, no fabricated diff, no non-existent endpoint call |
| Items panel — DTO-bound (L-02) | **CONFIRMED PRESENT** — no invented endpoint |
| Cross-capability governed-unavailable slots (ARCH-014 §11) | **CONFIRMED PRESENT** |

## Quality snapshot (independently re-verified by CERT-070A)

| Metric | Value |
| ------ | ----- |
| Package tests (`@apzhub/qep-test-plans`, full suite) | **104 PASS** |
| Presentation-specific tests (routes + views/journeys) | **20 / 20 PASS** |
| Typecheck | **PASS** |
| Playwright E2E spec | **PRESENT** — `apzqep-eng-070a-test-plans-workbench.spec.ts` |
| Domain/Infrastructure source touched by ENG-070A | **NONE** |
| Package version | **0.2.0 (unchanged)** |

## Recommendations

| Topic | Recommendation |
| ----- | -------------- |
| Production class | **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS** |
| Version | Remain **0.2.0**; label **WORKBENCH COMPONENT CERTIFIED** upon Owner Decision |
| Freeze | **Not eligible / not recommended** at this gate |
| Next capability work | Test Plans **Capability Certification** remains a separate, future, Owner-authorised programme requiring Domain + Infrastructure + Workbench assessed together |

## Independence

No production code, remediation, React/Next.js edit, or Domain/Infrastructure modification performed under CERT-070A. Only re-verification of already-delivered quality gates (test/typecheck execution) and documentation were performed.

## STOP

Await Owner Certification Decision.
