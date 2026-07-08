# AT-014 — Completion Report

> **Story:** AT-014 — E2E tests  
> **Sprint:** SPR-007 — Activity & Timeline Framework  
> **Date:** 2026-07-05  
> **Status:** Complete — **await owner approval before AT-015**

---

## Objective

Add end-to-end verification for the Activity & Timeline Framework — Playwright E2E, hidden diagnostics hooks, and health verification. No production features or framework enhancements.

---

## Acceptance criteria

| Criterion                                                       | Status |
| --------------------------------------------------------------- | ------ |
| Playwright spec `spr-007-activity-timeline-framework.spec.ts`   | ✅     |
| Health endpoint (`activities`, `timelines`, service, hydration) | ✅     |
| Authenticated shell provider diagnostics                        | ✅     |
| Context Panel tab visible + open/close                          | ✅     |
| Action → Event Bus → Mapper → Service → Timeline pipeline       | ✅     |
| Parallel notification fan-out                                   | ✅     |
| Action delegation via Action Framework                          | ✅     |
| Hidden diagnostics only (no visible debug UI)                   | ✅     |
| Quality gates                                                   | ✅     |

---

## Deliverables

| Artifact                             | Path                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------ |
| Playwright E2E spec                  | `testing/playwright/e2e/spr-007-activity-timeline-framework.spec.ts`     |
| Activity E2E hooks                   | `apps/web/lib/e2e-activity-timeline-hooks.ts`                            |
| Presentation refresh hook (E2E-only) | `apps/web/lib/e2e-activity-timeline-presentation-refresh.ts`             |
| Hook unit tests                      | `apps/web/lib/e2e-activity-timeline-hooks.test.tsx`                      |
| E2E verification report              | [AT-014-e2e-verification-report.md](./AT-014-e2e-verification-report.md) |

---

## E2E scenarios (6)

| #   | Scenario            | Verification                                                               |
| --- | ------------------- | -------------------------------------------------------------------------- |
| 1   | Health endpoint     | `activities` + `timelines` fields, bootstrap, mapper subscriber, hydration |
| 2   | Authenticated shell | Hidden `activity-timeline-diagnostics`, registry counts, service status    |
| 3   | Context Panel       | Activity tab, empty state, toggle open/close                               |
| 4   | Event pipeline      | Action audit → activity in timeline + notification badge                   |
| 5   | Action delegation   | Seeded `actionRef` → `Open action` → second activity via audit             |
| 6   | Diagnostics guard   | All `*-diagnostics` elements hidden                                        |

---

## Test hooks (env-gated)

Mounted only when `NEXT_PUBLIC_E2E_TEST_HOOKS=true` (Playwright webServer):

| Hook                                    | Purpose                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `getActivityCount()`                    | Session store count                                                      |
| `getActivityTitles()`                   | Mapped activity titles                                                   |
| `seedActivityActionDelegationFixture()` | Deterministic item with `actionRef`                                      |
| `refreshActivityTimelinePresentation()` | E2E-only remount key for Timeline Experience (no live subscriptions yet) |

Existing `executeWorkbenchAction()` / `getUnreadCount()` from EN-016 reused for pipeline tests.

Production builds without the env var do not mount hooks or presentation refresh.

---

## Test results

| Suite                       | Result         |
| --------------------------- | -------------- |
| AT-014 Playwright           | ✅ 6 passed    |
| Full Playwright             | ✅ 36 passed   |
| Unit tests                  | ✅ 1308 passed |
| Typecheck / lint / coverage | ✅             |

---

## Technical debt

| Item                                  | Notes                                                                               |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| No live subscriptions                 | Timeline UI does not auto-update — E2E uses `refreshActivityTimelinePresentation()` |
| Delegation fixture via test hook      | Real mapper pipeline does not populate `actionRef` on audit events yet              |
| `refreshActivityTimelinePresentation` | Test infrastructure only — remove when live subscriptions land                      |
| Viewed/unread state                   | Not verified in E2E                                                                 |
| Search / filter UI                    | Out of scope                                                                        |

---

## Recommendation for AT-015

1. Document E2E hooks and `NEXT_PUBLIC_E2E_TEST_HOOKS` in activity timeline onboarding guide
2. Document Context Panel integration and enable flags in architecture doc
3. Finalise `SPR-007-spec-index.md` with AT-014 complete
4. Note live subscription deferral and E2E refresh workaround in governance handbook
5. Keep AT-015 documentation-only — no production code

---

## Stop condition

**AT-014 complete.** Await owner approval before AT-015 (documentation & governance).

---

_AT-014 Completion Report — SPR-007 Milestone 7._
