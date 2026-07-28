# Certification Report — APZQEP-CERT-070A

| Field                     | Value                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Programme                 | **APZQEP-CERT-070A**                                                                                                 |
| Title                     | Test Plans Workbench Component Certification                                                                         |
| Package                   | `@apzhub/qep-test-plans` **0.2.0**                                                                                   |
| Status                    | **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION**                                                              |
| Certification level       | **Component Certification** (Workbench) — not Capability Certification                                               |
| Recommended class         | **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS**                                                                      |
| Outcome                   | **PASS (recommended)** — Owner Certification Decision not yet recorded                                               |
| Nature                    | Independent assurance — no engineering, no remediation, no React/Next.js edits                                       |
| Date                      | 2026-07-28                                                                                                           |
| Evidence                  | `docs/operations/evidence/portfolio-recert/20260728T073000Z-APZQEP-CERT-070A.json`                                   |
| Independence              | [OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md)                   |
| Levels                    | [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md)                               |
| ENG-070A Owner Acceptance | [../workbench/OWNER-ACCEPTANCE.md](../workbench/OWNER-ACCEPTANCE.md) — **ACCEPTED / APPROVED / CLOSED** (2026-07-28) |

## Scope statement

This is **Workbench Component Certification** — evaluation of the Test Plans presentation layer **as delivered and Owner-Accepted** under `APZQEP-ENG-070A`. It is **not** Test Plans Capability Certification (which additionally requires the Domain, Infrastructure, and Workbench components to be assessed together as one certified capability, typically at **1.0.0**). Component Certification classifications name the layer explicitly (`WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS`), per [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md).

## Decision (recommended — Owner Decision pending)

**WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS**

### Rationale

The Workbench as Owner-Accepted under `APZQEP-ENG-070A` meets APZ QEP Component production standards for a presentation layer: it conforms to the accepted Workbench Architecture (**ARCH-014**) and Workbench Engineering Specification (**OES-ENG-070A**), renders every user action exclusively from the server `availableActions` contract, introduces no business rules, and consumes the certified Domain (0.1.0) and Infrastructure (0.2.0) without contract change. The recorded limitations — inherited Infrastructure limitations L-01/L-02 and presentation-level items P-01…P-04 — define current scope and test-authoring breadth; they are not correctness defects and do not force `CERTIFICATION_FAILED`.

| Outcome                                     | Why not selected                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| WORKBENCH_PRODUCTION_READY (no limitations) | Recorded limitations (L-01, L-02, P-01…P-04) remain material to the component surface                                       |
| CERTIFICATION_FAILED                        | No mandatory Workbench gate failed; presentation-layer purity intact; no architectural drift found; no remediation required |

## Governance compliance

| Item                                                                                         | Result   |
| -------------------------------------------------------------------------------------------- | -------- |
| Document 000 / OES-000 / OES-001 / OES-002                                                   | **PASS** |
| Lifecycle: ARCH-014 → OES-ENG-070A → ENG-070A → ECR PASS → Owner Acceptance complete         | **PASS** |
| ENG-070A ACCEPTED / CLOSED; no open engineering under that identifier                        | **PASS** |
| Evidence traceable (ECR, Owner Acceptance, implementation)                                   | **PASS** |
| Certification independence (no code, no React/Next.js edits, no remediation under CERT-070A) | **PASS** |

## Workbench architectural conformance (ARCH-014)

| Area                                                                   | Result                                                                                                   |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Shell placement / module registration                                  | **PASS** — `modules/qep-test-plans/module.yaml`, permission-gated Sidebar IA                             |
| Route tree / deep links                                                | **PASS** — `packages/qep-test-plans/src/presentation/routes.ts` full surface incl. governed Compare slot |
| Dashboard / Explorer / Review / Search                                 | **PASS**                                                                                                 |
| Inspector (Summary, Metadata, Items, Relationships, History, Versions) | **PASS**                                                                                                 |
| Create / Edit Draft                                                    | **PASS**                                                                                                 |
| Action Bar & dialogs (structural + simple-confirm)                     | **PASS** — all 19 catalogued actions                                                                     |
| Cross-capability governed-unavailable slots (ARCH-014 §11)             | **PASS** — no fabricated Test Execution / Run / Evidence / Defect screens                                |
| Session / URL query persistence                                        | **PASS**                                                                                                 |
| No architectural drift vs ARCH-014 / OES-ENG-070A                      | **PASS**                                                                                                 |

## Presentation-layer integrity

| Check                                                             | Result                                                                                                                       |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| No business rules in the client                                   | **PASS** — spot-checked `presentation/`, `qep-test-plan-api.ts`, `qep-test-plan-views.tsx`; confirmed by ARCH-014/ECR review |
| No direct Domain/database calls from the client                   | **PASS** — REST via `/api/v1/qep/plans/*` only                                                                               |
| No duplication of Domain/Infrastructure lifecycle or policy logic | **PASS**                                                                                                                     |
| Design System tokens only, no hardcoded styling                   | **PASS**                                                                                                                     |

## `availableActions` contract — sole action authority

| Check                                                                                                                                   | Result                                |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Every action-bar control gated by `dto.availableActions` (`hasAction`, `planActionVisible`)                                             | **PASS**                              |
| No hardcoded transition matrix; no invented transitions                                                                                 | **PASS**                              |
| Negative test: action absent from `availableActions` never renders                                                                      | **PASS** — Vitest + Playwright E2E-10 |
| Structural dialogs (`updateMetadata`, `transferOwnership`, `updateAssignment`, `updateSchedule`) route through the same gated mechanism | **PASS**                              |
| Binding invariant honoured: _"The Workbench SHALL never determine what a user may do"_ (ARCH-014 Owner Acceptance)                      | **PASS**                              |

## Domain / Infrastructure contract preservation

| Check                                                                                      | Result                                                                                                       |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Domain **0.1.0 CERTIFIED** (CERT-060A) semantics unchanged                                 | **PASS**                                                                                                     |
| Infrastructure **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (CERT-060B) contract unchanged | **PASS** — no file under `packages/qep-test-plans/src/domain/` or `src/infrastructure/` modified by ENG-070A |
| No new migrations, no schema mutation                                                      | **PASS**                                                                                                     |
| Package version unchanged                                                                  | **PASS** — remains `@apzhub/qep-test-plans` **0.2.0**                                                        |
| Consumption exclusively via `/api/v1/qep/plans/*`                                          | **PASS**                                                                                                     |

## L-01 / L-02 honesty

| Check                                                                                | Result                                                                                                                                             |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| L-01 (Compare unavailable) presented as a live, navigable, governed-unavailable slot | **PASS** — no fabricated client-side diff; no call to a non-existent compare endpoint (Playwright fixture throws if ever called; assertion passes) |
| L-02 (items on DTO) — Items panel binds to `dto.items[]`                             | **PASS** — no invented dedicated `GET .../items` client call                                                                                       |
| Limitations inherited from certified Infrastructure, not remediated by CERT-070A     | **PASS** — consistent with [OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md)                      |

## Accessibility (WCAG AA intent)

| Gate                                                                                                                     | Result                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A11Y-01 axe clean (serious/critical = 0) on Dashboard, Explorer, Review, Inspector, Compare-unavailable, primary dialogs | **PASS** (Playwright)                                                                                                                                                        |
| A11Y-02 full keyboard operability Explorer → Inspector → action                                                          | **PASS** (Playwright)                                                                                                                                                        |
| A11Y-03 dialog focus trap + Escape + focus restore                                                                       | **PASS** (Playwright)                                                                                                                                                        |
| A11Y-04 status never colour-only                                                                                         | **PASS** — `QepStatusBadge` text label                                                                                                                                       |
| A11Y-05 `prefers-reduced-motion` respected                                                                               | **PASS** — no bespoke animation; Design System tokens govern motion                                                                                                          |
| A11Y-06 correct table/grid and tab/region ARIA semantics                                                                 | **PASS** — shared `qep-ui` primitives                                                                                                                                        |
| Recorded gap                                                                                                             | Create/Edit Draft and Relationships/History/Versions sub-panels not separately axe-scanned (P-03) — reuse already-scanned primitives; recorded, not treated as a failed gate |

See [ACCESSIBILITY.md](../workbench/ACCESSIBILITY.md) (ENG-070A pack, re-cited by this Certification).

## Test evidence (re-cited and independently re-verified by CERT)

| Suite                                                                                                                  | Result                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/qep-test-plans` full package suite (`pnpm --filter @apzhub/qep-test-plans test`), incl. `routes.test.ts` (5) | **104 / 104 PASS** (re-verified 2026-07-28)                                                                                                                                                                                                                                                                |
| `apps/web/components/qep/qep-test-plan-views.test.tsx` (views / journeys / `availableActions` contract)                | **15 / 15 PASS** (re-verified 2026-07-28)                                                                                                                                                                                                                                                                  |
| Presentation-specific total (5 route + 15 views)                                                                       | **20 / 20 PASS** — matches ENG-070A Completion Report claim                                                                                                                                                                                                                                                |
| `pnpm --filter @apzhub/qep-test-plans typecheck`                                                                       | **PASS** (re-verified 2026-07-28)                                                                                                                                                                                                                                                                          |
| Playwright E2E file                                                                                                    | **PRESENT** — `testing/playwright/e2e/apzqep-eng-070a-test-plans-workbench.spec.ts` (495 lines; smoke, authenticated journeys, axe, keyboard) — filed and reviewed; not re-executed by CERT (no re-engineering; browser E2E execution is an operational/CI concern, not a certification re-implementation) |
| E2E-06/07/08/11 breadth                                                                                                | **PARTIAL** — recorded honestly in ENG-070A [KNOWN-LIMITATIONS.md](../workbench/KNOWN-LIMITATIONS.md); underlying `availableActions`-gated mechanism proven by asserted journeys; test-authoring gap only, not an architectural gap                                                                        |

CERT-070A performed **no re-engineering, no test inflation, and no new test authoring** — the above is re-verification of what ENG-070A already delivered.

## Documentation

| Check                                                                                                                                      | Result   |
| ------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| `workbench/` pack complete (README, Completion Report, ECR + checklist, Accessibility, Known Limitations, Owner Summary, Owner Acceptance) | **PASS** |
| CERT-070A pack complete (this pack)                                                                                                        | **PASS** |
| Cross-references consistent (ARCH-014, OES-ENG-070A, CERT-060A, CERT-060B)                                                                 | **PASS** |

## Operational readiness

See [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md). **PASS** — module registered, Sidebar IA permission-gated, routes wired, no deployment blockers identified for the Workbench component within its defined scope.

## Certification independence

| Check                                                                       | Result   |
| --------------------------------------------------------------------------- | -------- |
| No production code changed under CERT-070A                                  | **PASS** |
| No React/Next.js edits under CERT-070A                                      | **PASS** |
| No remediation of L-01, L-02, or P-01…P-04 under CERT-070A                  | **PASS** |
| Only re-verification (test/typecheck execution) and documentation performed | **PASS** |

## Limitations impact

See [KNOWN-LIMITATIONS-REVIEW.md](./KNOWN-LIMITATIONS-REVIEW.md). Limitations **define scope**; they do **not** force `CERTIFICATION_FAILED`.

## Production classification

**WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS** (recommended)

## Version

**Remain 0.2.0.** Label **WORKBENCH COMPONENT CERTIFIED** upon Owner Decision. No promotion to 1.0.0 — reserved for Capability Certification.

## Freeze

**NOT AUTHORISED** (recommended).

## Evidence

- Assurance: `20260728T073000Z-APZQEP-CERT-070A.json`
- Upstream: `20260728T071000Z-APZQEP-ENG-070A-ECR.json`, `20260728T072749Z-APZQEP-ENG-070A-ACCEPTANCE.json`

## STOP

```text
Programme: APZQEP-CERT-070A
Status: IMPLEMENTED
AWAITING OWNER CERTIFICATION DECISION

NO ENGINEERING
NO REMEDIATION
NO 1.0.0
NO FREEZE
```
