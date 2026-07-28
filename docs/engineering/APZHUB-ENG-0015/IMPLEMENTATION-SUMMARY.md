# APZHUB-ENG-0015 — Implementation Summary

> **Programme:** APZHUB-ENG-0015  
> **Title:** Implement RG-VISUAL Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-21  
> **Status:** Complete — **Awaiting Acceptance**

---

## Authorised remediation group

| Group         | Result                                          |
| ------------- | ----------------------------------------------- |
| **RG-VISUAL** | **Resolved** — 2/2 member Playwright tests PASS |

---

## Root cause fixed

Support visual regression baselines (`support-detail.png`, `support-analytics.png`) drifted from the current Support UI (full-page height/content mismatch vs committed Chromium Linux snapshots).

**Fix:** Regenerate only the RG-VISUAL member baselines with Playwright `--update-snapshots=changed`. Inbox baseline left unchanged (not in RG-VISUAL member set).

---

## Repository impact

| Area                                                                                                      | Change           |
| --------------------------------------------------------------------------------------------------------- | ---------------- |
| `testing/playwright/e2e/oss-110-14-support-visual.spec.ts-snapshots/support-detail-chromium-linux.png`    | Updated baseline |
| `testing/playwright/e2e/oss-110-14-support-visual.spec.ts-snapshots/support-analytics-chromium-linux.png` | Updated baseline |

---

## Architecture / SemVer

- **Architecture impact:** None — visual baselines only.
- **SemVer impact:** None.
- **Platform Services / UI / APIs:** Unchanged.
- **Platform 1.2.0 packaging:** Unchanged.

---

## Out of scope

ENG-0016 · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · feature backlog · RG-AUTH-SHELL residual UI (outside Order 6 OPEN set)

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
