# APZHUB-ENG-0010 — Remediation Evidence

> **Programme:** APZHUB-ENG-0010  
> **Group:** RG-PW-API  
> **Date:** 2026-07-21

---

## STEP 1 — Selection

| Field         | Value                                 |
| ------------- | ------------------------------------- |
| Plan order    | **5** — next OPEN after RG-MOCK-FETCH |
| Prior groups  | Orders 1–4 + RG-MOCK-FETCH REMEDIATED |
| Status before | **OPEN**                              |
| Dependencies  | Satisfied                             |

---

## STEP 2 — Verification

| Field                        | Value                                                                                        |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| Remediation Group Identifier | RG-PW-API                                                                                    |
| Title                        | Playwright `getByLabel` API correction                                                       |
| Root Cause                   | Tests call `page.getByLabelText` (non-existent Playwright API)                               |
| Affected Packages            | Playwright e2e specs only                                                                    |
| Affected Products            | APZHUB Platform (Reporting); APZ TCMS                                                        |
| Affected Platform Services   | None                                                                                         |
| Dependencies                 | Satisfied                                                                                    |
| Acceptance Criteria          | Member tests no longer throw `getByLabelText is not a function`; assertions use `getByLabel` |
| Architecture Impact          | None                                                                                         |
| SemVer Impact                | None                                                                                         |
| Est. failure reduction       | **3**                                                                                        |

---

## Member test closure

| ID       | Spec                                 | Result                      |
| -------- | ------------------------------------ | --------------------------- |
| QA-F-009 | `apzreport-002` — toolbar/landmarks  | **PASS**                    |
| QA-F-014 | `apztcms-022` — opens EI             | **PASS**                    |
| QA-F-015 | `apztcms-022` — panel tabs/landmarks | **PASS** (1 flaky residual) |

**Group remaining hard failures:** **0**  
**Group remaining flaky:** **1**

---

## Residual (other groups — not modified)

RG-SELECTORS · RG-METRICS-WB · RG-TCMS-WB · RG-WORKFLOW-WB · RG-VISUAL · RG-AUTH-SHELL UI residuals
