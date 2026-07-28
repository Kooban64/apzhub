# Known Limitations — APZQEP-CERT-080A (consolidated)

These limitations are **inherited** from the three preceding Component Certifications, re-confirmed unchanged, and do **not** fail Capability Certification gates. They are **expected** or **documented non-blocking caveats**, not correctness defects.

## Inherited from Infrastructure (APZQEP-CERT-060B)

| ID | Limitation | Owner classification | Capability-level disposition |
| -- | ---------- | -------------------- | ------------------------------ |
| L-01 | Version comparison (`CompareVersions` / `GET .../compare`) not implemented | Deferred capability | Scope limitation. Workbench presents a live, navigable, **governed unavailable** slot — no fabricated diff, no call to a non-existent endpoint. New ENG programme required if/when delivered. |
| L-02 | Dedicated `GET .../items` not provided; items available on plan GET DTO | Approved variance | Scope/API shape, not a correctness defect. Items panel binds to `dto.items[]` throughout the Workbench. |
| L-03 | Package line coverage below aspirational OES % objectives (ECR: 77.07% lines) | Accepted with justification | No artificial test expansion performed or required; behavioural coverage (Domain, Application, in-memory Infrastructure) is high; only the Postgres executor and presentation constant stubs pull the aggregate down. |

## Inherited from Workbench (APZQEP-CERT-070A)

| ID | Item | Classification | Capability-level disposition |
| -- | ---- | --------------- | ------------------------------ |
| P-01 | Playwright journeys for Mark Ready → Start Execution → Complete → Archive chain, Supersede, Clone not asserted as discrete UI click-through tests | Test-authoring completeness gap | Does not block. Identical `availableActions`-gated rendering mechanism proven by asserted journeys (submit/approve/reject/returnToDraft/updateAssignment) and negative test E2E-10. |
| P-02 | Not-found (404) governed state not separately Playwright-asserted (only forbidden/403 is) | Test-authoring completeness gap | Does not block. Typed error mapping exists in `qep-test-plan-api.ts` / `QepErrorState`; same code path as the asserted 403 case. |
| P-03 | Create/Edit Draft and Relationships/History/Versions panels not separately axe-scanned | Test-authoring completeness gap | Does not block. These reuse the same `qep-ui` primitives already axe-scanned on Dashboard/Explorer/Inspector/Review/Compare. |
| P-04 | Preference Service named saved views not implemented | Approved scope boundary (OES-ENG-070A Part 2 §10 requires only URL/session round-trip, delivered) | Does not block. Not required by the accepted OES; a future personalisation programme, if desired. |

## Inherited from Domain (APZQEP-CERT-060A)

| Limitation | Status |
| ---------- | ------ |
| No AI / MCP implementation | Expected — consumer architecture only; out of Capability Certification scope |
| No Evidence / Coverage / Impact / Certification Engine integration | Expected — future programmes, outside the Test Plans capability boundary |

## Manifest metadata staleness (documentation-only, recorded, not a limitation of correctness)

`modules/qep-test-plans/module.yaml` metadata text and `packages/qep-test-plans/src/index.ts::QEP_TEST_PLANS_PROGRAMME` retain pre-ENG-070A-Acceptance wording. First recorded at CERT-070A; re-confirmed unchanged here. Not remediated under this or any CERT programme (certification independence); available to a future maintenance action.

## Determination

| Question | Answer |
| -------- | ------ |
| Do these limitations invalidate capability correctness? | **No** |
| Do they define current capability scope / test-authoring breadth? | **Yes** |
| Appropriate class | **PRODUCTION_READY_WITH_LIMITATIONS** |
| Require remediation before Capability Certification? | **No** — each was already Owner-accepted at its originating layer's certification; this Capability Certification evaluates the integrated whole as delivered |

## Freeze implication

None of the above limitations are remediated by this pack. If the Owner grants Certification and a subsequent Owner Freeze Decision, these limitations remain **outside** the frozen **1.0.0** Test Plans capability surface until separately authorised — consistent with the CERT-050D → Owner Freeze Decision precedent for Test Specifications.

## Explicit non-limitations (correct, deliberate absences)

Fabricated client-side Compare diff · fabricated cross-capability screens (Test Execution / Run / Evidence / Defects — governed unavailable by ARCH-014 §11 design) · Domain or Infrastructure business rules in the Workbench client · dedicated large-scale load-test campaign (see [PERFORMANCE-REVIEW.md](./PERFORMANCE-REVIEW.md)) · Capability Freeze (recommendation only, not executed) · SemVer 1.0.0 (recommendation only, not applied)
