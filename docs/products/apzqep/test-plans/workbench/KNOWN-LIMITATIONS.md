# Known Limitations — APZQEP-ENG-070A (presentation level)

| Field     | Value                                                                                 |
| --------- | ------------------------------------------------------------------------------------- |
| Programme | APZQEP-ENG-070A                                                                       |
| Layer     | Presentation (Workbench)                                                              |
| Status    | **RECORDED** — do not invalidate Workbench correctness or the ECR PASS decision       |
| Evidence  | `docs/operations/evidence/portfolio-recert/20260728T071000Z-APZQEP-ENG-070A-ECR.json` |

## Inherited Infrastructure limitations (presentation-honest representation)

These limitations originate at the certified Infrastructure layer (`ENG-060B` / `CERT-060B`, see [../infrastructure/KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md)) and are **not** remediated by this programme. The Workbench represents them honestly rather than working around them.

| ID   | Limitation                                                               | Presentation treatment                                                                                                                                                                                                                                        | Future treatment                                                                                  |
| ---- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| L-01 | Version comparison (`GET .../compare`) not implemented at Infrastructure | Compare route (`/plans/{id}/compare`) is a **live, navigable governed unavailable slot** — no call to any compare endpoint, no fabricated client-side diff (verified: Playwright asserts the mocked compare route throws if ever called, and the test passes) | New ENG programme if/when Infrastructure delivers the endpoint; route contract is stable/additive |
| L-02 | Dedicated `GET .../items` not provided; items on Plan DTO                | Items panel binds to `dto.items[]`; no dedicated items client call exists                                                                                                                                                                                     | API evolution under a new programme if required                                                   |

## Presentation-level items (this programme)

| ID   | Item                                                                                                                                                               | Classification                                                                                             | Rationale                                                                                                                                                                                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-01 | Playwright journeys E2E-06 (Mark Ready → Start Execution → Complete → Archive), E2E-07 (Supersede), E2E-08 (Clone) not asserted as discrete UI click-through tests | Test-authoring completeness gap, not an architectural or implementation gap                                | The identical `availableActions`-gated rendering algorithm (Part 3 §4) used by these actions is proven by the journeys that are asserted (submit/approve/reject/returnToDraft/updateAssignment) and the negative test E2E-10; API mocks for supersede/clone exist in the Playwright fixture |
| P-02 | Not-found (404) governed state not separately Playwright-asserted (only forbidden/403 is)                                                                          | Test-authoring completeness gap                                                                            | Typed error mapping for 404 exists in `qep-test-plan-api.ts` / `QepErrorState`; same code path as the asserted 403 case                                                                                                                                                                     |
| P-03 | Create/Edit Draft and Relationships/History/Versions panels not separately axe-scanned                                                                             | Test-authoring completeness gap                                                                            | These reuse the same `qep-ui` primitives already axe-scanned on Dashboard/Explorer/Inspector/Review/Compare                                                                                                                                                                                 |
| P-04 | Preference Service named saved views not implemented                                                                                                               | Approved scope boundary (OES-ENG-070A Part 2 §10 requires only URL/session round-trip, which is delivered) | Not required by this OES; future personalisation programme if desired                                                                                                                                                                                                                       |

## Explicitly not limitations (correct, deliberate absences)

- Live Version Compare API call — **forbidden** by L-01 governance, not a gap
- Fabricated client-side diff for Compare — **forbidden**, not a gap
- Domain or Infrastructure business rules in the client — **forbidden**, correctly absent
- Fake Test Execution / Run / Evidence / Defect screens — governed unavailable by ARCH-014 §11 design (WP-14), not a gap
- Capability Certification / Freeze / 1.0.0 — separate, later Owner gates, not part of this programme's scope

## Structural dialogs (explicitly confirmed present, not deferred)

`updateMetadata`, `transferOwnership`, `updateAssignment`, and `updateSchedule` dialogs are **wired** in `apps/web/components/qep/qep-test-plan-views.tsx`, each gated by its respective `availableActions` entry and exercised by Vitest (`executes updateAssignment when the server exposes it in availableActions`). No structural dialog was found missing or deferred at ECR review time.

## C-01/C-02 note (Infrastructure-origin, unchanged here)

Discrete lifecycle `POST` action paths (vs `/actions/{action}`) are inherited as Specs-aligned Infrastructure variance (see infrastructure `ENGINEERING-COMPLETION-REVIEW.md` C-03) and are consumed as-is by the typed client; this is not a Workbench-level limitation.
