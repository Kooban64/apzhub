# APZHUB-ENG-0011 — Remediation Evidence

> **Programme:** APZHUB-ENG-0011  
> **Group:** RG-SELECTORS  
> **Date:** 2026-07-21

---

## STEP 1 — Selection

| Field         | Value                                |
| ------------- | ------------------------------------ |
| Plan order    | **5** — last OPEN hygiene group      |
| Prior         | RG-MOCK-FETCH · RG-PW-API REMEDIATED |
| Status before | **OPEN**                             |
| Dependencies  | Satisfied                            |

---

## STEP 2 — Verification

| Field                      | Value                                                                   |
| -------------------------- | ----------------------------------------------------------------------- |
| Identifier                 | RG-SELECTORS                                                            |
| Title                      | Ambiguous Playwright locator disambiguation                             |
| Root Cause                 | Ambiguous `getByText` matches multiple nodes (cell + heading/highlight) |
| Affected Packages          | Playwright e2e specs only                                               |
| Affected Products          | APZ Documents · APZHUB Search · APZ TCMS · APZHUB Observe               |
| Affected Platform Services | None                                                                    |
| Dependencies               | Satisfied                                                               |
| Acceptance Criteria        | Member tests pass without strict-mode collisions                        |
| Architecture Impact        | None                                                                    |
| SemVer Impact              | None                                                                    |
| Est. failure reduction     | **4**                                                                   |

---

## Member closure

| ID       | Result                      |
| -------- | --------------------------- |
| QA-F-003 | **PASS**                    |
| QA-F-010 | **PASS**                    |
| QA-F-013 | **PASS** (1 flaky residual) |
| QA-F-056 | **PASS**                    |

---

## Residual (not modified)

RG-METRICS-WB · RG-TCMS-WB · RG-WORKFLOW-WB · RG-VISUAL · RG-AUTH-SHELL UI residuals
