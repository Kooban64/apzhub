# APZHUB-QA-CERT-004 — Platform 1.2.0 Visual Certification Review

> **Programme:** APZHUB-QA-CERT-004  
> **Classification:** QUALITY CERTIFICATION  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Rule:** No application source modifications — Playwright baseline only if expected  
> **Decision:** **B — expected / incorrect baseline** (not a software regression)  
> **Recommendation:** **READY FOR OWNER VISUAL ACCEPTANCE**  
> **Status:** **ACCEPTED**

## Pack

| Document          | Path                                           |
| ----------------- | ---------------------------------------------- |
| Visual Comparison | [VISUAL-COMPARISON.md](./VISUAL-COMPARISON.md) |
| Root Cause        | [ROOT-CAUSE.md](./ROOT-CAUSE.md)               |
| Baseline Decision | [BASELINE-DECISION.md](./BASELINE-DECISION.md) |
| Quality Evidence  | [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)   |
| Completion Report | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md) |
| Owner Acceptance  | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)   |
| Evidence images   | [evidence/](./evidence/)                       |

## Scope

| Item                | Result                                           |
| ------------------- | ------------------------------------------------ |
| Investigated        | `support-analytics.png` only                     |
| Application source  | **Unchanged**                                    |
| Baseline updated    | **Yes** — Chromium Linux analytics snapshot only |
| Visual suite verify | **3/3 PASS**                                     |

## Preconditions

| Check                  | Result                                                |
| ---------------------- | ----------------------------------------------------- |
| APZHUB-QA-CERT-003     | Completed (**CERTIFICATION FAILED** on this residual) |
| Engineering programmes | Remain **CLOSED**                                     |
| Engineering authorised | **None**                                              |
