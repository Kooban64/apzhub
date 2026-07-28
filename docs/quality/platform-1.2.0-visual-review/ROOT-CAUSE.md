# APZHUB-QA-CERT-004 — Root Cause

> **Programme:** APZHUB-QA-CERT-004  
> **Date:** 2026-07-21

---

## Verdict class

**B — Expected / baseline defect** (not a genuine application regression)

---

## Root cause

The committed Chromium Linux snapshot  
`testing/playwright/e2e/oss-110-14-support-visual.spec.ts-snapshots/support-analytics-chromium-linux.png`  
contained a screenshot of the **Home** placeholder workspace (`/workspace/home`), not Support Analytics (`/workspace/support/analytics`).

CERT-003 compared that incorrect expected image to a correctly rendered Support Analytics page, producing:

1. Full-page dimension mismatch (1280×928 vs 1280×1064)
2. Near-total pixel diff (wrong page vs right page)

## Why this is not a product regression

| Check                             | Finding                                                         |
| --------------------------------- | --------------------------------------------------------------- |
| Actual route UI                   | Support Analytics cards + distributions render as designed      |
| Mock / API                        | `mockSupportApi` returns the expected intelligence snapshot     |
| Component                         | `SupportAnalyticsView` structure matches the actual screenshot  |
| Sibling visuals                   | Inbox and detail baselines (same suite) **PASS** without update |
| Application source under CERT-004 | **Not modified**                                                |

## Likely provenance of bad baseline

Prior programmes (ENG-0015 / ENG-0020) regenerated Support visual snapshots. The analytics file on disk at CERT-003 time depicted Home, indicating a stale or mis-captured baseline relative to the named asset — not an Analytics UI break in Platform 1.2.0 source.

## Flaky-test review (CERT-003 retry-only — recommendations only)

| Case                                 | Likely class                            | Recommendation (no code change in this programme)                       |
| ------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------- |
| `apznotify-004` notice strict-mode   | Strict-mode locator (duplicate text)    | Prefer role/test-id scoped locator under a future engineering programme |
| `apztcms-010` / `012` shell/heading  | Timing / activation race                | Await workbench shell readiness markers                                 |
| `apztcms-022` / `023` EI / executive | Timing / mock readiness                 | Await section test-ids before assertions                                |
| Support Soft performance baseline    | Performance variance + detail readiness | Soft timing harness; first-attempt timeout under load                   |

None of the flaky cases were treated as hard certification blockers after retry success. No code modified for flaky review.
