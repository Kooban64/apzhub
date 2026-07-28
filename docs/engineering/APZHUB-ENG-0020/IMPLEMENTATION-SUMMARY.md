# APZHUB-ENG-0020 — Implementation Summary

> **Programme:** APZHUB-ENG-0020  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Groups:** RG-SUPPORT-CERT · RG-OBSERVE-WB · RG-VISUAL-INBOX

## Preconditions verified

| Check                        | Result                                                                     |
| ---------------------------- | -------------------------------------------------------------------------- |
| APZHUB-ENG-0019              | **ACCEPTED** (Owner Decision)                                              |
| ENGINEERING-PLAN Step 5      | RG-SUPPORT-CERT + RG-VISUAL-INBOX + RG-OBSERVE-WB                          |
| Groups repository-approved   | Yes                                                                        |
| Status before implementation | **OPEN**                                                                   |
| Dependencies                 | Visual after Support if UI changes — batch authorised; Observe independent |

## STEP 2 — Group contracts

### RG-SUPPORT-CERT

| Field                      | Value                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| Identifier                 | RG-SUPPORT-CERT                                                                              |
| Title                      | Support certification residual (error map / a11y / lifecycle)                                |
| Root cause                 | RCA-06                                                                                       |
| Included failures          | QA2-F-009…014                                                                                |
| Affected packages          | `apps/web` (Support) · `testing/playwright`                                                  |
| Affected products          | APZ Support                                                                                  |
| Affected platform services | Support                                                                                      |
| Dependencies               | Independent of Law groups                                                                    |
| Acceptance criteria        | 403/503/cross-tenant safe-error landmarks; Tab reaches inbox control; request lifecycle PASS |
| Architecture impact        | Minimal — query retry/invalidation hygiene only                                              |
| SemVer impact              | None                                                                                         |
| Est. reduction             | **6** Playwright hard                                                                        |

### RG-OBSERVE-WB

| Field                      | Value                                             |
| -------------------------- | ------------------------------------------------- |
| Identifier                 | RG-OBSERVE-WB                                     |
| Title                      | Observe workbench journey hardening               |
| Root cause                 | RCA-08                                            |
| Included failures          | QA2-F-001                                         |
| Affected packages          | `testing/playwright`                              |
| Affected products          | Platform Observe                                  |
| Affected platform services | Observe                                           |
| Dependencies               | None                                              |
| Acceptance criteria        | Manifest journey PASS (strict-mode safe locators) |
| Architecture impact        | None                                              |
| SemVer impact              | None                                              |
| Est. reduction             | **1** Playwright hard                             |

### RG-VISUAL-INBOX

| Field                      | Value                                 |
| -------------------------- | ------------------------------------- |
| Identifier                 | RG-VISUAL-INBOX                       |
| Title                      | Support inbox visual baseline refresh |
| Root cause                 | RCA-09                                |
| Included failures          | QA2-F-015                             |
| Affected packages          | Playwright snapshot assets            |
| Affected products          | APZ Support                           |
| Affected platform services | Support                               |
| Dependencies               | After Support UI changes              |
| Acceptance criteria        | Inbox screenshot PASS                 |
| Architecture impact        | None                                  |
| SemVer impact              | None                                  |
| Est. reduction             | **1** Playwright hard                 |

## Changes (summary)

1. **RG-SUPPORT-CERT — product:** `shouldRetrySupportQuery` — no TanStack retry on terminal Support codes (FORBIDDEN / UNAVAILABLE / NOT_FOUND / …); inbox/analytics/detail use it. Detail view keeps cached content on refetch error; article composers invalidate **articles only** (commands stay attached).
2. **RG-SUPPORT-CERT — tests:** a11y Tab starts focus inside `support-page`; cert lifecycle navigates via inbox (OSS-110-13 path).
3. **RG-OBSERVE-WB:** `hc_pw` / `md_pw` asserted via `getByRole('cell')` (strict-mode; matches `ad_pw` pattern).
4. **RG-VISUAL-INBOX:** regenerated `support-inbox-chromium-linux.png` (800→928 height drift).

## Result

All three groups **implemented**. Recommendation: **READY FOR OWNER ACCEPTANCE**.
