# APZHUB-ENG-0013 — Remediation Evidence

> **Programme:** APZHUB-ENG-0013  
> **Group:** RG-TCMS-WB  
> **Order:** 6 (after RG-METRICS-WB)  
> **Date:** 2026-07-21

---

## STEP 1 — Selection

| Field         | Value                                                             |
| ------------- | ----------------------------------------------------------------- |
| Plan order    | **6** — `RG-METRICS-WB + RG-TCMS-WB + RG-WORKFLOW-WB + RG-VISUAL` |
| Prior         | RG-METRICS-WB **REMEDIATED** (ENG-0012 **ACCEPTED**)              |
| Status before | **OPEN** · Repository Approved · next in order                    |
| Dependencies  | Satisfied (Order 5 hygiene + METRICS-WB closed)                   |

---

## STEP 2 — Verification

| Field                      | Value                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Identifier                 | RG-TCMS-WB                                                                                                         |
| Title                      | TCMS workbench shells — testing-* testids / landmarks                                                              |
| Root Cause                 | Expected testing-* testids / landmarks not found (UI or mock path) — missing `/api/v1/testing/**` Playwright mocks |
| Affected Packages          | Playwright e2e spec only (`testing/playwright/e2e`)                                                                |
| Affected Products          | APZ TCMS (Testing workbench)                                                                                       |
| Affected Platform Services | None (mocked HTTP; Testing Platform Services unchanged)                                                            |
| Dependencies               | Satisfied                                                                                                          |
| Acceptance Criteria        | Both member tests PASS                                                                                             |
| Architecture Impact        | None                                                                                                               |
| SemVer Impact              | None                                                                                                               |
| Est. failure reduction     | **2**                                                                                                              |

---

## Member closure

| ID       | Result   |
| -------- | -------- |
| QA-F-011 | **PASS** |
| QA-F-012 | **PASS** |

---

## Remaining OPEN (Order 6, repository order)

1. RG-WORKFLOW-WB
2. RG-VISUAL
