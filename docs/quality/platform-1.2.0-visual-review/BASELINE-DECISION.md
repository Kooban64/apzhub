# APZHUB-QA-CERT-004 — Baseline Decision

> **Programme:** APZHUB-QA-CERT-004  
> **Date:** 2026-07-21

---

## Decision

| Field              | Value                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Classification     | **B — expected UI / incorrect baseline**                                                                  |
| Action taken       | Update **only** Playwright visual baseline for analytics                                                  |
| Application source | **Not modified**                                                                                          |
| File updated       | `testing/playwright/e2e/oss-110-14-support-visual.spec.ts-snapshots/support-analytics-chromium-linux.png` |
| New dimensions     | **1280×1064**                                                                                             |
| Method             | `pnpm exec playwright test … --update-snapshots=changed` on `oss-110-14-support-visual.spec.ts`           |

## Explicit non-actions

- No Support component / CSS / mock changes
- Inbox and detail baselines left unchanged (already green)
- No flaky-test code changes

## Post-update verification

Visual suite re-run **without** snapshot update: **3/3 PASS**.
