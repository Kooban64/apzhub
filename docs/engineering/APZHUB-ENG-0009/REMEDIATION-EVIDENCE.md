# APZHUB-ENG-0009 — Remediation Evidence

> **Programme:** APZHUB-ENG-0009  
> **Group:** RG-MOCK-FETCH  
> **Date:** 2026-07-21

---

## STEP 1 — Selection

| Field         | Value                                           |
| ------------- | ----------------------------------------------- |
| Plan order    | **5** first OPEN member (`ENGINEERING-PLAN.md`) |
| Prior groups  | Orders 1–4 REMEDIATED (ENG-0006…0008)           |
| Status before | **OPEN**                                        |
| Dependencies  | Satisfied                                       |

---

## STEP 2 — Verification

| Field                        | Value                                                                     |
| ---------------------------- | ------------------------------------------------------------------------- |
| Remediation Group Identifier | RG-MOCK-FETCH                                                             |
| Title                        | Mocked `page.evaluate` fetch absolute URL hygiene                         |
| Root Cause                   | Relative `fetch` in `page.evaluate` lacks base URL on `about:blank`       |
| Affected Products            | APZHUB Platform (HTTP typed-client certs)                                 |
| Affected Packages            | Playwright e2e specs only (`testing/playwright/e2e/*-003-*-http.spec.ts`) |
| Affected Platform Services   | None                                                                      |
| Dependencies                 | Satisfied                                                                 |
| Acceptance Criteria          | Four member mock-fetch tests PASS                                         |
| Architecture Impact          | None                                                                      |
| SemVer Impact                | None                                                                      |
| Est. failure reduction       | **4**                                                                     |

---

## Member test closure

| ID       | Spec                                       | Result   |
| -------- | ------------------------------------------ | -------- |
| QA-F-002 | `apzadmin-003-administration-http.spec.ts` | **PASS** |
| QA-F-004 | `apzidentity-003-identity-http.spec.ts`    | **PASS** |
| QA-F-005 | `apzmetrics-003-metrics-http.spec.ts`      | **PASS** |
| QA-F-008 | `apzobserve-003-observe-http.spec.ts`      | **PASS** |

**Group remaining failures:** **0**  
**Group remaining flaky:** **0**

---

## Residual (other groups — not modified)

RG-PW-API · RG-SELECTORS · RG-METRICS-WB · RG-TCMS-WB · RG-WORKFLOW-WB · RG-VISUAL · RG-AUTH-SHELL UI residuals
