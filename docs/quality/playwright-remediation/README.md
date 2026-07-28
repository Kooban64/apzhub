# APZHUB-QA-RECERT-001 — Platform 1.2 Portfolio Playwright Failure Analysis & Remediation Planning

> **Programme:** APZHUB-QA-RECERT-001  
> **Classification:** ENGINEERING ANALYSIS  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-20  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** Accepted — first remediation APZHUB-ENG-0006 (RG-HEALTH-503 → RG-AUTH-SHELL)  
> **Engineering closure:** Orders 1–6 complete (ENG-0006…0015 **ACCEPTED**). Portfolio re-cert: [APZHUB-QA-CERT-001](../portfolio-recertification/README.md) (**ACCEPTED** · **CERTIFICATION FAILED**).  
> **Residual plan:** [APZHUB-QA-RECERT-002](../residual-analysis/README.md) — new remediation groups / ENGINEERING-PLAN (Awaiting Owner Review).  
> **Rule:** Historical analysis + Orders 1–6 engineering closed. Further engineering requires Owner Approval of residual plan (QA-RECERT-002) then a named ENG programme.

---

## Source evidence (APZHUB-ENG-0005)

| Artefact                   | Path                                                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playwright FAIL JSON       | [docs/operations/evidence/portfolio-recert/20260720T174042Z-R12-QA-01-playwright-FAIL.json](../../operations/evidence/portfolio-recert/20260720T174042Z-R12-QA-01-playwright-FAIL.json) |
| Host classification        | […FAILURE-CLASSIFICATION.md](../../operations/evidence/portfolio-recert/20260720T174042Z-R12-QA-01-playwright-FAILURE-CLASSIFICATION.md)                                                |
| Playwright `test-results/` | Repository `test-results/` (error-context.md + traces on retry)                                                                                                                         |
| Suite summary              | **77 passed** · **55 failed** · **1 flaky** · ~36.9m                                                                                                                                    |

---

## Pack contents

| Document                                           | Purpose                                      |
| -------------------------------------------------- | -------------------------------------------- |
| [FAILURE-INVENTORY.md](./FAILURE-INVENTORY.md)     | Every failing + flaky test classified        |
| [ROOT-CAUSE-ANALYSIS.md](./ROOT-CAUSE-ANALYSIS.md) | Root cause summary                           |
| [FAILURE-CATEGORIES.md](./FAILURE-CATEGORIES.md)   | Category statistics                          |
| [PRODUCT-HEATMAP.md](./PRODUCT-HEATMAP.md)         | Failures by commercial/platform product      |
| [PACKAGE-HEATMAP.md](./PACKAGE-HEATMAP.md)         | Failures by package / surface                |
| [REMEDIATION-GROUPS.md](./REMEDIATION-GROUPS.md)   | Common remediation themes                    |
| [ENGINEERING-PLAN.md](./ENGINEERING-PLAN.md)       | Suggested engineering order (not authorised) |
| [PRIORITY-MATRIX.md](./PRIORITY-MATRIX.md)         | Priority view                                |
| [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)     | Scope compliance                             |
| [ACCEPTANCE-REPORT.md](./ACCEPTANCE-REPORT.md)     | Owner Acceptance request                     |

---

## Snapshot

| Metric                          | Value                                              |
| ------------------------------- | -------------------------------------------------- |
| Total failures analysed         | **55** (+ **1** flaky)                             |
| Remediation groups              | **11**                                             |
| Largest root-cause group        | **RG-AUTH-SHELL** (20)                             |
| Highest-value engineering group | **RG-HEALTH-503 → RG-AUTH-SHELL** (unlock cascade) |
| Suggested ENG programmes        | **6** bounded remediation programmes               |

---

## Explicit non-goals

- No Playwright fixes
- No Platform **1.2.0** mutation
- No APZHUB-ENG-0006
- No Email SoR · FIN-001 · Workflow Execute · Release 1.3
