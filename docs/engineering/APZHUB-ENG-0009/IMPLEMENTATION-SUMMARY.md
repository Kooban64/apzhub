# APZHUB-ENG-0009 — Implementation Summary

> **Programme:** APZHUB-ENG-0009  
> **Title:** Implement RG-MOCK-FETCH Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-21  
> **Status:** **ACCEPTED / CLOSED** (Owner Decision with APZHUB-ENG-0010)

---

## Authorised remediation group

| Group             | Result                                                    |
| ----------------- | --------------------------------------------------------- |
| **RG-MOCK-FETCH** | **Resolved** — 4/4 member Playwright HTTP mock tests PASS |

---

## Root cause fixed

`page.evaluate` called `fetch("/api/v1/...")` with a relative path while the page was still on `about:blank`, so Chromium had no document base URL and the request failed before Playwright `page.route` mocks could serve envelopes.

**Fix:** Pass Playwright `baseURL` origin into `page.evaluate` and use absolute URLs for mocked fetches (test hygiene only).

---

## Repository impact

| Area                                                              | Change                                   |
| ----------------------------------------------------------------- | ---------------------------------------- |
| `testing/playwright/e2e/apzadmin-003-administration-http.spec.ts` | Absolute fetch URLs via `baseURL` origin |
| `testing/playwright/e2e/apzidentity-003-identity-http.spec.ts`    | Absolute fetch URLs via `baseURL` origin |
| `testing/playwright/e2e/apzmetrics-003-metrics-http.spec.ts`      | Absolute fetch URLs via `baseURL` origin |
| `testing/playwright/e2e/apzobserve-003-observe-http.spec.ts`      | Absolute fetch URLs via `baseURL` origin |

---

## Architecture / SemVer

- **Architecture impact:** None — Playwright test defect only.
- **SemVer impact:** None.
- **Public APIs / DB / Platform Services:** Unchanged.
- **Platform 1.2.0 packaging:** Unchanged.

---

## Out of scope (not modified)

RG-PW-API · RG-SELECTORS · product workbench residuals · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · ENG-0010

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
