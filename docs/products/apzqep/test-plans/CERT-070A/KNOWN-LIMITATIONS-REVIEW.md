# Known Limitations Review — APZQEP-CERT-070A

| Field | Value |
| ----- | ----- |
| Programme | APZQEP-CERT-070A |
| Source | ENG-070A Owner Acceptance · [../workbench/KNOWN-LIMITATIONS.md](../workbench/KNOWN-LIMITATIONS.md) · Infrastructure [../infrastructure/KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md) |
| Result | Limitations **do not block** Workbench Component production classification with limitations |

## Inherited Infrastructure limitations (presentation-honest representation)

| ID | Topic | Workbench treatment (ENG-070A) | CERT-070A impact on production readiness |
| -- | ----- | ------------------------------- | ------------------------------------------ |
| L-01 | Version comparison (`GET .../compare`) not implemented at Infrastructure | Compare route is a live, navigable **governed unavailable** slot; no fabricated diff; no call to a non-existent endpoint (verified by Playwright fixture that throws if ever called) | **Scope limitation** — does not impair the presentation surface's correctness; new ENG programme required if/when Infrastructure delivers the endpoint |
| L-02 | Dedicated `GET .../items` not provided; items on Plan DTO | Items panel binds to `dto.items[]`; no dedicated items client call exists | **Scope/API shape** — items available on plan GET; not a correctness defect |

## Presentation-level items (ENG-070A, scope-defining)

| ID | Item | Classification | CERT-070A disposition |
| -- | ---- | --------------- | ----------------------- |
| P-01 | Playwright journeys for Mark Ready → Start Execution → Complete → Archive chain, Supersede, Clone not asserted as discrete UI click-through tests | Test-authoring completeness gap, not architectural | **Does not block** — identical `availableActions`-gated rendering mechanism proven by asserted journeys (submit/approve/reject/returnToDraft/updateAssignment) and negative test E2E-10 |
| P-02 | Not-found (404) governed state not separately Playwright-asserted (only forbidden/403 is) | Test-authoring completeness gap | **Does not block** — typed error mapping exists in `qep-test-plan-api.ts` / `QepErrorState`; same code path as the asserted 403 case |
| P-03 | Create/Edit Draft and Relationships/History/Versions panels not separately axe-scanned | Test-authoring completeness gap | **Does not block** — these reuse the same `qep-ui` primitives already axe-scanned on Dashboard/Explorer/Inspector/Review/Compare |
| P-04 | Preference Service named saved views not implemented | Approved scope boundary (OES-ENG-070A Part 2 §10 requires only URL/session round-trip, which is delivered) | **Does not block** — not required by the accepted OES; a future personalisation programme, if desired |

## Determination

| Question | Answer |
| -------- | ------ |
| Do limitations invalidate Workbench correctness? | **No** |
| Do they define current component scope (test-authoring breadth / preferences)? | **Yes** |
| Appropriate class | **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS** |
| Require remediation before CERT? | **No** — Owner already accepted ENG-070A with these limitations recorded; CERT evaluates as delivered |

## Explicit non-limitations (correct, deliberate absences)

Domain changes · Infrastructure contract changes · fabricated Version Compare · fabricated cross-capability screens (Test Execution / Run / Evidence / Defects — governed unavailable by ARCH-014 §11 design) · Capability Certification · Capability Freeze · SemVer 1.0.0
