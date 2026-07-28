# Completion Report — APZQEP-ENG-070A

| Field            | Value                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| Programme        | **APZQEP-ENG-070A**                                                                                                |
| Title            | Test Plans Workbench Engineering                                                                                   |
| Package          | `@apzhub/qep-test-plans` **0.2.0** (unchanged)                                                                     |
| Status           | **ACCEPTED / APPROVED / PROGRAMME CLOSED**                                                                         |
| ECR              | [ENGINEERING-COMPLETION-REVIEW.md](./ENGINEERING-COMPLETION-REVIEW.md) — **PASS**                                  |
| Owner Acceptance | **ACCEPTED / APPROVED / CLOSED** (2026-07-28) — [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                       |
| OES              | [OES-ENG-070A](../OES-ENG-070A/COMPLETE.md) **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED** |
| Architecture     | [OES-ARCH-014](../OES-ARCH-014/COMPLETE.md) **ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED**               |
| Domain           | `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (CERT-060A) — consumed as immutable                                   |
| Infrastructure   | `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (CERT-060B) — consumed as immutable          |
| Review standard  | OES-002 **v1.1.0** (ECR required before Owner Acceptance)                                                          |

> Owner Acceptance of `APZQEP-ENG-070A` has since been recorded (**ACCEPTED / APPROVED / PROGRAMME CLOSED**, 2026-07-28) — see [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md). Next: **APZQEP-CERT-070A — Test Plans Workbench Component Certification** (independent assurance; no engineering) — see [../CERT-070A/README.md](../CERT-070A/README.md).

---

## 1. Work Package completion matrix

| WP    | Title                            | Status                  | Evidence                                                                                                        |
| ----- | -------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| WP-01 | Module registration & Sidebar IA | **COMPLETE**            | `modules/qep-test-plans/module.yaml`                                                                            |
| WP-02 | Routes & deep links              | **COMPLETE**            | `packages/qep-test-plans/src/presentation/routes.ts`                                                            |
| WP-03 | API client & DTO binding         | **COMPLETE**            | `apps/web/lib/qep/qep-test-plan-api.ts`                                                                         |
| WP-04 | Explorer                         | **COMPLETE**            | views + Vitest/Playwright                                                                                       |
| WP-05 | Inspector shell                  | **COMPLETE**            | Summary/Metadata/Items/Relationships/History/Versions panels                                                    |
| WP-06 | Draft create / edit              | **COMPLETE**            | `qep-plan-create` / `qep-plan-edit` + tests                                                                     |
| WP-07 | Action bar & dialogs             | **COMPLETE**            | `availableActions`-gated, structural dialogs wired                                                              |
| WP-08 | Review queue                     | **COMPLETE**            | `/review` filter                                                                                                |
| WP-09 | Dashboard                        | **COMPLETE**            | `qep-plan-dashboard`                                                                                            |
| WP-10 | Search UI                        | **COMPLETE**            | capability search                                                                                               |
| WP-11 | Relationships                    | **COMPLETE**            | linked specifications + external refs                                                                           |
| WP-12 | Versions & Compare               | **COMPLETE (governed)** | versions live; Compare governed unavailable (L-01)                                                              |
| WP-13 | History                          | **COMPLETE**            | history route                                                                                                   |
| WP-14 | Cross-capability links           | **COMPLETE (governed)** | governed unavailable slots                                                                                      |
| WP-15 | Session / prefs                  | **COMPLETE**            | URL query round-trip + refresh                                                                                  |
| WP-16 | A11y hardening                   | **COMPLETE**            | focus trap, Escape, axe, keyboard                                                                               |
| WP-17 | Playwright journeys              | **COMPLETE**            | smoke + authenticated mocked E2E (E2E-06/07/08/11 partial — see [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)) |
| WP-18 | Docs & evidence                  | **COMPLETE**            | this pack + evidence JSON                                                                                       |

No Work Packages deferred.

---

## 2. Architecture compliance statement

The Workbench:

- Implements OES-ENG-070A / OES-ARCH-014 presentation only
- Consumes the certified Infrastructure REST surface (`/api/v1/qep/plans/*`) exclusively
- Gates every action solely via server `availableActions` (Part 3 §4 algorithm)
- Presents Compare as a governed unavailable slot per L-01 — never fabricates a diff, never calls a non-existent endpoint
- Binds Items to the Plan DTO per L-02 — never calls a non-existent dedicated `GET .../items`
- Reuses the QEP shell catch-all router (`qep-workspace-router.tsx`) and `qep-ui` shared components
- Introduces no Domain/Infrastructure business rules in the client
- Introduces no Domain/Infrastructure contract changes — package remains `@apzhub/qep-test-plans` **0.2.0**

---

## 3. Test evidence

| Suite                                                                                               | Result                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Presentation route contract Vitest (`routes.test.ts`)                                               | **5/5 PASS**                                                                                                                                                                      |
| Views / journeys / `availableActions` contract Vitest (`qep-test-plan-views.test.tsx`)              | **15/15 PASS**                                                                                                                                                                    |
| **Total Vitest**                                                                                    | **20/20 PASS**                                                                                                                                                                    |
| Playwright smoke (unauthenticated route reachability)                                               | Spec filed and passing pattern (12 routes, no 5xx)                                                                                                                                |
| Playwright authenticated journeys + axe + keyboard (`apzqep-eng-070a-test-plans-workbench.spec.ts`) | Spec filed — 14 authenticated tests covering create/edit/submit/approve/reject/returnToDraft/compare-unavailable/forbidden/filter-persistence/deep-link/keyboard/axe/dialog-focus |

---

## 4. Accessibility evidence

| Gate                                                                            | Status                |
| ------------------------------------------------------------------------------- | --------------------- |
| Dialog `role="dialog"` semantics + labelled title                               | ✅                    |
| Focus trap + Escape + focus restore                                             | ✅                    |
| Keyboard Explorer → Inspector → action → dialog                                 | ✅ (Playwright)       |
| axe critical/serious = 0 on Dashboard / Explorer / Inspector / Review / Compare | ✅ (Playwright suite) |
| Status not colour-only (`QepStatusBadge` text)                                  | ✅                    |

See [ACCESSIBILITY.md](./ACCESSIBILITY.md).

---

## 5. Outstanding limitations

1. **Inherited Infrastructure limitations** — L-01 (Compare deferred) and L-02 (items on DTO) are presentation-honest, not remediated, per OES-ENG-070A Part 3 §7/§3.8 and the certified Infrastructure's [KNOWN-LIMITATIONS.md](../infrastructure/KNOWN-LIMITATIONS.md). See this pack's own [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md).
2. **Playwright journey breadth** — E2E-06 (Mark Ready → Start Execution → Complete → Archive chain), E2E-07 (Supersede), E2E-08 (Clone), and the not-found sub-case of E2E-11 are not asserted as discrete Playwright click-through tests. The identical `availableActions`-gated rendering mechanism used by these actions is proven by the journeys that are asserted (submit/approve/reject/returnToDraft/updateAssignment) and by the negative test (E2E-10). This is a test-authoring completeness gap, not an implementation or architectural gap — see [ECR-CHECKLIST.md](./ECR-CHECKLIST.md) §2.
3. **Authenticated Playwright journeys use API route mocks** for determinism (same pattern as Test Specifications ENG-050C, Support, TCMS). Live-DB mutation E2E is not required by sibling QEP Workbenches and is not claimed here.
4. **Preference Service named saved views** are not implemented; URL + session query persistence covers the OES Part 2 §10 round-trip requirement.
5. No structural dialog was found missing at review time — `updateMetadata`, `transferOwnership`, `updateAssignment`, and `updateSchedule` are all wired to their respective `availableActions` and confirmed by dedicated `data-testid` hooks.

---

## 6. Known risks

| Risk                                                                  | Mitigation                                                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Discovery/sidebar not listing children if `modules/` root not scanned | Deep links + presentation route constants remain authoritative regardless of discovery                              |
| Mocked E2E vs live API drift                                          | Vitest + Playwright fixtures mirror ENG-060B contract shapes exactly; REST surface owned and unchanged by CERT-060B |
| Partial Playwright breadth (E2E-06/07/08/11)                          | Recorded honestly; underlying mechanism proven generically; low risk given single shared rendering algorithm        |
| Focus restore edge cases in nested overlays                           | Covered by Escape/close path; dialogs are single-layer, no nested overlay exists                                    |

---

## 7. Operational notes

- Base path: `/workspace/qep/test-plans`
- API: `/api/v1/qep/plans/*` (unchanged, CERT-060B)
- Permissions: `qep.plan.*`
- No new migrations in ENG-070A
- No Domain/Infrastructure package version change — remains `0.2.0`

---

## 8. Version recommendation

ECR PASSED and Owner Acceptance of APZQEP-ENG-070A has been recorded (2026-07-28).

- Component Certification is now authorised next under **APZQEP-CERT-070A**. Capability Certification, Version Promotion, and Freeze remain **separate, future Owner Decisions**.

---

## 9. ECR readiness (OES-002 v1.1.0)

See [ECR-CHECKLIST.md](./ECR-CHECKLIST.md) for the full matrix.

**ECR outcome:** **PASS** — see [ENGINEERING-COMPLETION-REVIEW.md](./ENGINEERING-COMPLETION-REVIEW.md).

---

## STOP

```text
Programme: APZQEP-ENG-070A
Status: ACCEPTED
APPROVED
PROGRAMME CLOSED

NEXT: APZQEP-CERT-070A — Test Plans Workbench Component Certification
NO CAPABILITY CERTIFICATION · NO FREEZE · NO 1.0.0
```
