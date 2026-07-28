# APZHUB-QA-RECERT-002 — Residual Portfolio Certification Failure Analysis

> **Programme:** APZHUB-QA-RECERT-002  
> **Classification:** QUALITY ANALYSIS  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Status:** **ACCEPTED / CLOSED**  
> **Follow-on:** Engineering Wave 2 **COMPLETE** (ENG-0016…**0021** **ACCEPTED**). Final portfolio re-cert: [APZHUB-QA-CERT-002](../final-certification/README.md) (**CERTIFICATION FAILED**)

## Preconditions

| Check                              | Result                                                          |
| ---------------------------------- | --------------------------------------------------------------- |
| APZHUB-QA-CERT-001                 | **ACCEPTED** (Owner Decision) · result **CERTIFICATION FAILED** |
| Orders 1–6 remediation engineering | **CLOSED**                                                      |
| Engineering authorised             | **None** until new plan Owner-approved                          |

## Pack

| Document             | Path                                                 |
| -------------------- | ---------------------------------------------------- |
| Failure Inventory    | [FAILURE-INVENTORY.md](./FAILURE-INVENTORY.md)       |
| Root Cause Analysis  | [ROOT-CAUSE-ANALYSIS.md](./ROOT-CAUSE-ANALYSIS.md)   |
| Remediation Groups   | [REMEDIATION-GROUPS.md](./REMEDIATION-GROUPS.md)     |
| Engineering Plan     | [ENGINEERING-PLAN.md](./ENGINEERING-PLAN.md)         |
| Quality Summary      | [QUALITY-SUMMARY.md](./QUALITY-SUMMARY.md)           |
| Programme Completion | [PROGRAMME-COMPLETION.md](./PROGRAMME-COMPLETION.md) |

## Input evidence

- [20260721T120046Z-R12-QA-01-full-FAIL.json](../../operations/evidence/portfolio-recert/20260721T120046Z-R12-QA-01-full-FAIL.json)
- [20260721T120154Z-APZHUB-QA-CERT-001-SUMMARY.json](../../operations/evidence/portfolio-recert/20260721T120154Z-APZHUB-QA-CERT-001-SUMMARY.json)
- [portfolio-recertification pack](../portfolio-recertification/README.md)
- Host logs: `/tmp/qa-cert-001/{lint,typecheck,vitest,portfolio-full}.log`

## Snapshot totals

| Metric                                       |                Count |
| -------------------------------------------- | -------------------: |
| Playwright hard failures                     |               **19** |
| Playwright flaky                             |               **30** |
| Lint failures                                |                **1** |
| TypeScript failures                          |                **1** |
| Vitest failures (unit+integration+cert pins) |               **82** |
| Distinct root-cause themes                   |               **10** |
| New remediation groups                       |               **10** |
| Suggested engineering programmes             | **6** (compressible) |
