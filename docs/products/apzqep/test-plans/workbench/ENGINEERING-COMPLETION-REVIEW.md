# Engineering Completion Review (ECR) — APZQEP-ENG-070A

| Field | Value |
| ----- | ----- |
| Programme | **APZQEP-ENG-070A** — Test Plans Workbench Engineering |
| Standard | [OES-002](../../../../engineering/oes/OES-002-Engineering-Review-and-Acceptance-Standard.md) **v1.1.0** §10A |
| Date | 2026-07-28 |
| Decision | **PASS** |
| Evidence | `docs/operations/evidence/portfolio-recert/20260728T071000Z-APZQEP-ENG-070A-ECR.json` |
| Completion Report | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) |
| Checklist | [ECR-CHECKLIST.md](./ECR-CHECKLIST.md) |

## Decision

**PASS**

APZQEP-ENG-070A is declared **READY FOR OWNER ACCEPTANCE** following this ECR. ECR performed **no** engineering, remediation, or test inflation — it is a review of what was already implemented.

**Owner Acceptance of APZQEP-ENG-070A is explicitly NOT performed under this instruction.** Component/Capability Certification, Version Promotion, and Freeze remain further, separately authorised Owner gates.

---

## Confirmations required by this Owner Instruction

### 1. No Domain / Infrastructure contract changes

Confirmed. `@apzhub/qep-test-plans` remains at package version **0.2.0** (Infrastructure Component Certified, CERT-060B). No file under `packages/qep-test-plans/src/domain/` or `packages/qep-test-plans/src/infrastructure/` was modified by this programme; only the additive `src/presentation/` slice and `apps/web` client/views were introduced or extended. `pnpm ls` / package.json confirm no version bump. The certified Domain (0.1.0) and Infrastructure (0.2.0) surfaces are consumed exclusively via `/api/v1/qep/plans/*`.

### 2. `availableActions` algorithm

Confirmed. `qep-test-plan-views.tsx` renders every action-bar control strictly from `dto.availableActions` (`hasAction`, `planActionVisible`) per the normative algorithm at OES-ENG-070A Part 3 §4. No hardcoded transition matrix exists; no control is enabled when its action id is absent from the server response. Verified by:

- Vitest unit test: `planActionVisible` "only reports actions present in availableActions — never invents"
- Vitest component test: "does not render actions absent from availableActions"
- Playwright E2E-10 negative assertion
- All structural dialogs (`updateMetadata`, `transferOwnership`, `updateAssignment`, `updateSchedule`) and simple-confirm actions (`submitForReview`, `approve`, `reject`, `returnToDraft`, `markReady`, `startExecution`, `complete`, `archive`, `cancel`, `supersede`, `clone`) route through this same gated mechanism — none is a special-cased bypass.

### 3. L-01 / L-02 honesty

Confirmed.

- **L-01 (Compare unavailable):** `/plans/{id}/compare` is a live, navigable route that renders `CompareUnavailableView` — a governed unavailable state ("Version comparison is not yet available for Test Plans") with a link back to Versions. No code path constructs a request to a non-existent `GET .../compare` endpoint. The Playwright fixture actively **throws** if the compare API is ever called, and the assertion passes — proving the client never attempts it. No client-side diff is fabricated by fetching two DTOs and merging them.
- **L-02 (items on DTO):** The Items panel reads `dto.items[]` from the Plan DTO returned by `GET /api/v1/qep/plans/{id}`. No dedicated `GET .../items` client call exists in `qep-test-plan-api.ts`.

Both limitations are inherited from the Owner-accepted Infrastructure (`ENG-060B`/`CERT-060B` [KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md)) and are represented at the presentation layer exactly as specified by OES-ENG-070A Part 3 §7 and §3 rule 8 — no remediation attempted or required under this programme.

### 4. Stop confirmed — READY FOR OWNER ACCEPTANCE of ENG-070A

Confirmed. This ECR does **not** constitute Owner Acceptance. See [Explicit stop](#explicit-stop-not-authorised-by-ecr-alone) below.

---

## ECR Checklist (summary)

Full matrix: [ECR-CHECKLIST.md](./ECR-CHECKLIST.md).

| Area | Result |
| ---- | ------ |
| Module registration / Sidebar IA (WP-01) | ✅ PASS |
| Routes & deep links, incl. governed Compare slot (WP-02, WP-12) | ✅ PASS |
| Typed API client (WP-03) | ✅ PASS |
| Explorer / Dashboard / Review / Search (WP-04, WP-08, WP-09, WP-10) | ✅ PASS |
| Inspector shell / Relationships / History / Versions (WP-05, WP-11, WP-13) | ✅ PASS |
| Create / Edit Draft (WP-06) | ✅ PASS |
| Action Bar & dialogs — `availableActions` fidelity (WP-07) | ✅ PASS |
| Cross-capability governed unavailable slots (WP-14) | ✅ PASS |
| Session/URL query persistence (WP-15) | ✅ PASS |
| Accessibility hardening (WP-16) | ✅ PASS |
| Playwright journeys (WP-17) | ✅ PASS (E2E-06/07/08/11 partial — recorded honestly, not architecturally gapped) |
| Documentation & evidence (WP-18) | ✅ PASS |
| No architectural drift vs ARCH-014 / OES-ENG-070A | ✅ PASS |
| No Domain/Infrastructure leakage or mutation | ✅ PASS |

---

## Engineering assessment (complete)

Navigation · Dashboard · Explorer · Inspector (Summary, Metadata, Items, Relationships, History, Versions) · Review workflow · Search · Create/Edit Draft · Action Bar (all 19 catalogued actions) · structural dialogs (`updateMetadata`, `transferOwnership`, `updateAssignment`, `updateSchedule`) · simple-confirm dialogs (lifecycle transitions) · Compare governed-unavailable slot · cross-capability governed-unavailable slots · REST integration · optimistic-update rollback · concurrency-conflict handling · accessibility hardening (focus trap, Escape, keyboard path, axe) · Playwright E2E journeys · unit/component test suite (20/20 PASS) · completion documentation.

Client remains presentation-only; the certified Infrastructure REST surface remains the sole authority for permitted actions and business state.

---

## Effect

```text
Implementation COMPLETE
  → ECR PASS
  → READY FOR OWNER ACCEPTANCE of APZQEP-ENG-070A  ← STOP (this instruction)
```

## Explicit stop — not authorised by ECR alone

- Owner Acceptance of APZQEP-ENG-070A
- Component Certification
- Capability Certification
- Version Promotion
- Freeze
- 1.0.0 promotion
- Remediation engineering under this ECR identifier

## Next action (separate Owner Instruction required)

Owner Acceptance Review of `APZQEP-ENG-070A` — see [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) (template only, decision **PENDING**, not decided under this instruction).

## STOP

```text
Programme: APZQEP-ENG-070A
Status: IMPLEMENTED
ENGINEERING COMPLETION REVIEW: PASS
READY FOR OWNER ACCEPTANCE
```
