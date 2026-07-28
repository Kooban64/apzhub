# APZHUB-ENG-0015 — Remediation Evidence

> **Programme:** APZHUB-ENG-0015  
> **Group:** RG-VISUAL  
> **Order:** 6 (final)  
> **Date:** 2026-07-21

---

## STEP 1 — Selection

| Field         | Value                                                             |
| ------------- | ----------------------------------------------------------------- |
| Plan order    | **6** — `RG-METRICS-WB + RG-TCMS-WB + RG-WORKFLOW-WB + RG-VISUAL` |
| Prior         | RG-WORKFLOW-WB **REMEDIATED** (ENG-0014 **ACCEPTED**)             |
| Status before | **OPEN** · Repository Approved · next (final) in order            |
| Dependencies  | Satisfied                                                         |

---

## STEP 2 — Verification

| Field                      | Value                                                             |
| -------------------------- | ----------------------------------------------------------------- |
| Identifier                 | RG-VISUAL                                                         |
| Title                      | Support visual baselines — screenshot drift                       |
| Root Cause                 | Screenshot baseline drift vs current Support UI                   |
| Affected Packages          | Playwright snapshot assets (`testing/playwright/e2e/*-snapshots`) |
| Affected Products          | APZ Support                                                       |
| Affected Platform Services | None                                                              |
| Dependencies               | Satisfied                                                         |
| Acceptance Criteria        | Both member tests PASS                                            |
| Architecture Impact        | None                                                              |
| SemVer Impact              | None                                                              |
| Est. failure reduction     | **2**                                                             |

---

## Member closure

| ID       | Result   |
| -------- | -------- |
| QA-F-028 | **PASS** |
| QA-F-029 | **PASS** |

---

## Remaining OPEN (Order 6 / engineering plan)

**None.** Playwright Remediation Programme (Orders 1–6 authorised groups) complete.
