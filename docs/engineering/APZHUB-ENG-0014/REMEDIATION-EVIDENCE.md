# APZHUB-ENG-0014 — Remediation Evidence

> **Programme:** APZHUB-ENG-0014  
> **Group:** RG-WORKFLOW-WB  
> **Order:** 6 (after RG-TCMS-WB)  
> **Date:** 2026-07-21

---

## STEP 1 — Selection

| Field         | Value                                                             |
| ------------- | ----------------------------------------------------------------- |
| Plan order    | **6** — `RG-METRICS-WB + RG-TCMS-WB + RG-WORKFLOW-WB + RG-VISUAL` |
| Prior         | RG-TCMS-WB **REMEDIATED** (ENG-0013 **ACCEPTED**)                 |
| Status before | **OPEN** · Repository Approved · next in order                    |
| Dependencies  | Satisfied (Order 5 hygiene + METRICS-WB + TCMS-WB closed)         |

---

## STEP 2 — Verification

| Field                      | Value                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Identifier                 | RG-WORKFLOW-WB                                                                                        |
| Title                      | Workflow engine overview/list — READ-ONLY ENGINE / definition viewer                                  |
| Root Cause                 | READ-ONLY ENGINE text / list viewer not matching (mock path or timeout) — broken list mock path guard |
| Affected Packages          | Playwright e2e spec only (`testing/playwright/e2e`)                                                   |
| Affected Products          | APZ Workflow (Workflow Engine Workbench)                                                              |
| Affected Platform Services | None (mocked HTTP; Workflow Platform Services unchanged)                                              |
| Dependencies               | Satisfied                                                                                             |
| Acceptance Criteria        | Both member tests PASS                                                                                |
| Architecture Impact        | None                                                                                                  |
| SemVer Impact              | None                                                                                                  |
| Est. failure reduction     | **2**                                                                                                 |

---

## Member closure

| ID       | Result   |
| -------- | -------- |
| QA-F-016 | **PASS** |
| QA-F-017 | **PASS** |

---

## Remaining OPEN (Order 6, repository order)

1. RG-VISUAL
