# APZQEP-ENG-070A — Test Plans Workbench Engineering

| Field             | Value                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Programme         | **APZQEP-ENG-070A**                                                                                                |
| Title             | Test Plans Workbench Engineering                                                                                   |
| Capability        | Test Plans                                                                                                         |
| Layer             | Presentation (Workbench)                                                                                           |
| Package           | `@apzhub/qep-test-plans` **0.2.0** (unchanged — presentation adds no Domain/Infrastructure surface)                |
| Status            | **ACCEPTED / APPROVED / PROGRAMME CLOSED**                                                                         |
| ECR               | [ENGINEERING-COMPLETION-REVIEW.md](./ENGINEERING-COMPLETION-REVIEW.md) — **PASS**                                  |
| ECR checklist     | [ECR-CHECKLIST.md](./ECR-CHECKLIST.md)                                                                             |
| Completion Report | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                                                                     |
| Accessibility     | [ACCESSIBILITY.md](./ACCESSIBILITY.md)                                                                             |
| Known limitations | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                                                                     |
| Owner summary     | [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)                                                                             |
| Owner Acceptance  | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **ACCEPTED / APPROVED / CLOSED** (2026-07-28)                       |
| OES               | [OES-ENG-070A](../OES-ENG-070A/COMPLETE.md) **ACCEPTED / APPROVED / ENGINEERING SPECIFICATION BASELINED / CLOSED** |
| Architecture      | [OES-ARCH-014](../OES-ARCH-014/COMPLETE.md) **ACCEPTED / ARCHITECTURE BASELINED / PROGRAMME CLOSED**               |
| Domain            | `@apzhub/qep-test-plans` **0.1.0 CERTIFIED** (CERT-060A) — consumed as immutable                                   |
| Infrastructure    | `@apzhub/qep-test-plans` **0.2.0 INFRASTRUCTURE COMPONENT CERTIFIED** (CERT-060B) — consumed as immutable          |
| Evidence (ECR)    | `docs/operations/evidence/portfolio-recert/20260728T071000Z-APZQEP-ENG-070A-ECR.json`                              |
| Date              | 2026-07-28                                                                                                         |

## Purpose

Delivers the Test Plans Workbench (presentation layer) against the Owner-Accepted `APZQEP-OES-ENG-070A` engineering specification: Explorer, Inspector, Dashboard, Review queue, Search, Create/Edit Draft, the `availableActions`-driven Action Bar and dialogs, Versions/History, Relationships, a governed-unavailable Compare slot (Infrastructure limitation **L-01**), and an items panel bound to the Plan DTO (Infrastructure limitation **L-02**).

**Owner Acceptance of `APZQEP-ENG-070A` has been recorded (ACCEPTED / APPROVED / PROGRAMME CLOSED, 2026-07-28).** See [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md). Workbench Component Certification (**APZQEP-CERT-070A**) is now **CERTIFIED / APPROVED / CLOSED** — see [../CERT-070A/README.md](../CERT-070A/README.md). **Test Plans Capability Certification** (**APZQEP-CERT-080A** — Domain + Infrastructure + Workbench assessed together) is now next, **IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION** — see [../capability-certification/README.md](../capability-certification/README.md). Version Promotion and Freeze remain **not performed** and require further, separate Owner Decisions.

## What was implemented

| Area                 | Location                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Presentation routes  | `packages/qep-test-plans/src/presentation/` (`routes.ts`, `navigation.ts`, `permissions.ts`)                                                             |
| Module workbench nav | `modules/qep-test-plans/module.yaml`                                                                                                                     |
| HTTP client          | `apps/web/lib/qep/qep-test-plan-api.ts`                                                                                                                  |
| Views                | `apps/web/components/qep/qep-test-plan-views.tsx`                                                                                                        |
| Router wiring        | `apps/web/components/qep/qep-workspace-router.tsx`                                                                                                       |
| Unit/component tests | `packages/qep-test-plans/src/presentation/routes.test.ts` (5 tests) · `apps/web/components/qep/qep-test-plan-views.test.tsx` (15 tests) — **20/20 PASS** |
| Playwright E2E       | `testing/playwright/e2e/apzqep-eng-070a-test-plans-workbench.spec.ts`                                                                                    |

## Documentation

| Document                               | Path                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| Engineering Completion Review          | [ENGINEERING-COMPLETION-REVIEW.md](./ENGINEERING-COMPLETION-REVIEW.md)          |
| ECR checklist (full matrix)            | [ECR-CHECKLIST.md](./ECR-CHECKLIST.md)                                          |
| Completion Report                      | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                                  |
| Accessibility evidence                 | [ACCESSIBILITY.md](./ACCESSIBILITY.md)                                          |
| Known limitations (presentation-level) | [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)                                  |
| Owner summary                          | [OWNER-SUMMARY.md](./OWNER-SUMMARY.md)                                          |
| Owner Acceptance                       | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md) — **ACCEPTED / APPROVED / CLOSED** |

## Lifecycle

```text
APZQEP-ARCH-014 ACCEPTED / ARCHITECTURE BASELINED / CLOSED
  → APZQEP-OES-ENG-070A ACCEPTED / ENGINEERING SPECIFICATION BASELINED / CLOSED
  → APZQEP-ENG-070A implementation (this pack)
  → Engineering Completion Review — PASS (this pack)
  → Owner Acceptance — ACCEPTED / APPROVED / PROGRAMME CLOSED (2026-07-28)
  → APZQEP-CERT-070A — CERTIFIED / APPROVED / CLOSED (see ../CERT-070A/)
  → APZQEP-CERT-080A — CERTIFIED / APPROVED / CLOSED (see ../capability-certification/) — Test Plans Integrated Capability Certification · @apzhub/qep-test-plans 1.0.0 CERTIFIED
  → APZQEP-FREEZE-080A FROZEN / APPROVED / CLOSED (see ../freeze/) — @apzhub/qep-test-plans 1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED
```

## STOP

```text
Programme: APZQEP-ENG-070A
Status: ACCEPTED
APPROVED
PROGRAMME CLOSED

NEXT: APZQEP-CERT-080A — Test Plans Integrated Capability Certification
NO CAPABILITY CERTIFICATION DECISION YET RECORDED
NO FREEZE
NO 1.0.0
```
