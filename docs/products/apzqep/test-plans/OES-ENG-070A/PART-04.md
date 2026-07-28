# APZQEP-OES-ENG-070A
# PART 4 — Testing, Accessibility & Quality Gates

| Item | Value |
| ---- | ----- |
| Document | APZQEP-OES-ENG-070A |
| Part | **4 of 5** |
| Programme | APZQEP-OES-ENG-070A |
| Status | **IMPLEMENTED / AWAITING OWNER ACCEPTANCE** |

---

## 1. Quality bar (Document 015)

CI **MUST** pass: lint · types · build · unit/component · integration · Playwright (scoped) · security checks as the platform requires, before any future Workbench PR merges to main. Failing quality gates **MUST NOT** merge.

---

## 2. Test pyramid

| Layer | Scope |
| ----- | ----- |
| Unit | Action-visibility helpers (§4 algorithm), filter/URL codecs, pure DTO mappers, status→label mapping (Appendix B) |
| Component | Explorer row, Inspector panels, Action Bar, dialogs (React Testing Library) |
| Integration | API client against mocked Route Handlers / MSW using the ENG-060B contract shapes |
| E2E (Playwright) | Journeys in §3 below |
| Accessibility | axe on primary surfaces (§4 below) |

---

## 3. Mandatory Playwright journeys

| ID | Journey |
| -- | ------- |
| E2E-01 | Create Draft Plan → edit content/items/schedule → save |
| E2E-02 | Submit for review (`submit-for-review`) → Plan appears in Review queue |
| E2E-03 | Approve from Inspector (`approve`) |
| E2E-04 | Reject with rationale required (`reject`) |
| E2E-05 | Return to Draft after rejection (`return-to-draft`), only when exposed in `availableActions` |
| E2E-06 | Mark Ready → Start Execution → Complete → Archive lifecycle chain |
| E2E-07 | Supersede an Approved/Ready/In-Execution Plan → navigate to successor |
| E2E-08 | Clone a Plan → navigate to the new Draft |
| E2E-09 | Deep link `/plans/{planId}` opens Inspector at Summary |
| E2E-10 | Action absent from `availableActions` is never rendered / never clickable (negative test) |
| E2E-11 | Forbidden / not-found governed states for an inaccessible or missing `planId` |
| E2E-12 | Compare route renders the governed unavailable state — **no** network call to a non-existent compare endpoint |
| E2E-13 | Keyboard-only path: Explorer → Inspector → primary action → dialog → confirm |
| E2E-14 | Session restore: Explorer filters + selection persist across reload; re-fetch and permission re-validation occur before any action renders |

---

## 4. Accessibility gates (WCAG AA)

| Gate | Criterion |
| ---- | --------- |
| A11Y-01 | axe clean (serious/critical = 0) on Dashboard, Explorer, Review queue, Inspector (all panels), Compare unavailable slot, and primary dialogs |
| A11Y-02 | Full keyboard operability for E2E-13 |
| A11Y-03 | Focus trap in dialogs; focus restored to the triggering control on close |
| A11Y-04 | Status is never colour-only — badge text/icon accompanies colour |
| A11Y-05 | `prefers-reduced-motion` respected for all transitions/animations |
| A11Y-06 | Explorer / Review queue implement correct table/grid ARIA semantics; Inspector panels use correct tab/region roles |

---

## 5. Performance checks (engineering evidence, targets from ARCH-014 Part 5 §2)

| Check | Target |
| ----- | ------ |
| Explorer / Review queue pagination | Server-driven; `pageSize` ≤ 50 |
| Explorer first meaningful paint (warm) | Perceived interactive ≤ 2s |
| Inspector open after selection | ≤ 500ms after DTO available (network excluded) |
| Search debounce | 200–400ms before query |
| Large lists | Virtualisation **SHOULD** be used; unbounded DOM rendering **MUST NOT** occur |

Evidence **MAY** be qualitative in a future Completion Report if a formal performance harness is absent; regressions **MUST NOT** ignore obvious jank.

---

## 6. Negative / boundary tests (mandatory)

| ID | Case |
| -- | ---- |
| N-01 | `availableActions` empty array → no action controls render, only navigation |
| N-02 | Stale/expired session on a restored deep link → re-authenticates before rendering actionable UI |
| N-03 | Server returns a typed 403 → governed forbidden panel; no Plan content leaked |
| N-04 | Server returns a typed 404 → governed not-found panel |
| N-05 | Mutation fails after optimistic UI update → UI rolls back to last known-good server state and surfaces the typed error |
| N-06 | Concurrent edit conflict (`expectedRevision` mismatch) → typed conflict error surfaced, no silent overwrite |

---

## 7. Review gates (OES-002)

| Gate | When |
| ---- | ---- |
| Engineering Review | During / at the end of implementation WPs (future ENG-070A) |
| Engineering Completion Review (ECR) | After WP-01…18 complete, per OES-002 v1.1.0 |
| Workbench Owner Acceptance | After ECR PASS (or PASS WITH CONDITIONS disposed) |

---

## 8. Traceability

| This Part | Trace |
| --------- | ----- |
| Quality / DoD | Document 015 |
| Accessibility architecture | ARCH-014 Part 5 §3 |
| Performance targets | ARCH-014 Part 5 §2 |
| Action algorithm under test | Part 3 §4 (this OES) |
| Review process | OES-002 v1.1.0 |

---

## 9. Explicit non-goals (Part 4)

This Part does NOT define AI/MCP boundaries, quality gates before/after implementation start, or Owner Acceptance criteria for this OES (Part 5). It does not itself run any test — it specifies what a future engineering programme **SHALL** run.

---

## 10. STOP (Part 4)

```text
APZQEP-OES-ENG-070A
TEST PLAN SPECIFICATION ONLY
NO TESTS EXECUTED, NO CODE UNDER THIS PART
```
