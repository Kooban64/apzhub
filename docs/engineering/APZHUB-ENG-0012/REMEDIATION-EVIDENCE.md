# APZHUB-ENG-0012 — Remediation Evidence

> **Programme:** APZHUB-ENG-0012  
> **Group:** RG-METRICS-WB  
> **Order:** 6 (first)  
> **Date:** 2026-07-21

---

## STEP 1 — Selection

| Field         | Value                                    |
| ------------- | ---------------------------------------- |
| Plan order    | **6** — first listed: RG-METRICS-WB      |
| Prior         | Order 5 complete (ENG-0011 **ACCEPTED**) |
| Status before | **OPEN**                                 |
| Dependencies  | Satisfied (shell/test hygiene completed) |

---

## STEP 2 — Verification

| Field                      | Value                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Identifier                 | RG-METRICS-WB                                                                                         |
| Title                      | Metrics workbench page / unavailable testid visibility                                                |
| Root Cause                 | Expected metrics-page / unavailable testids not visible (route/mock/hydration) — harness missing auth |
| Affected Packages          | Playwright e2e spec only                                                                              |
| Affected Products          | APZHUB Platform (Metrics)                                                                             |
| Affected Platform Services | None (mocked HTTP)                                                                                    |
| Dependencies               | Satisfied                                                                                             |
| Acceptance Criteria        | Both member tests PASS                                                                                |
| Architecture Impact        | None                                                                                                  |
| SemVer Impact              | None                                                                                                  |
| Est. failure reduction     | **2**                                                                                                 |

---

## Member closure

| ID       | Result   |
| -------- | -------- |
| QA-F-006 | **PASS** |
| QA-F-007 | **PASS** |

---

## Remaining OPEN (Order 6, repository order)

1. RG-TCMS-WB
2. RG-WORKFLOW-WB
3. RG-VISUAL
