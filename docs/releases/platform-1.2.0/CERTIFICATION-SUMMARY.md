# Certification Summary — Platform 1.2.0

> **Programme:** APZHUB-RELEASE-001  
> **Date:** 2026-07-22

## Programme chain

| Programme     | Role                                         | Result / Status                                         |
| ------------- | -------------------------------------------- | ------------------------------------------------------- |
| QA-RECERT-001 | Playwright failure analysis                  | **ACCEPTED / CLOSED**                                   |
| ENG-0006…0015 | Wave 1 remediation Orders 1–6                | **ACCEPTED / CLOSED**                                   |
| QA-CERT-001   | Portfolio full re-cert                       | **ACCEPTED** · result **FAIL** (84/19/30)               |
| QA-RECERT-002 | Residual analysis · Wave 2 plan              | **ACCEPTED / CLOSED**                                   |
| ENG-0016…0021 | Engineering Wave 2                           | **ACCEPTED / CLOSED**                                   |
| QA-CERT-002   | Final re-cert after Wave 2                   | Executed **FAIL** (115/10/1)                            |
| ENG-0022      | Certification punch list                     | **ACCEPTED / CLOSED**                                   |
| QA-CERT-003   | Platform 1.2.0 final portfolio certification | Lint/tsc/Vitest/OpenAPI **PASS** · PW 119/1/6           |
| QA-CERT-004   | Visual certification review                  | **ACCEPTED** — baseline corrected · visual **3/3 PASS** |

## Final quality statistics

| Metric                            | Value                               |
| --------------------------------- | ----------------------------------- |
| Lint                              | **PASS**                            |
| TypeScript                        | **PASS**                            |
| Vitest passed                     | **5013**                            |
| Vitest failed                     | **0**                               |
| Playwright passed (CERT-003)      | **119**                             |
| Playwright hard failed (CERT-003) | **1** (closed by CERT-004 baseline) |
| Playwright flaky (CERT-003)       | **6** (retry PASS)                  |
| Support visual suite (CERT-004)   | **3/3 PASS**                        |
| Architecture                      | **PASS** (unchanged)                |
| Compatibility                     | **PASS** (unchanged)                |
| OpenAPI                           | **PASS**                            |

## Overall platform certification posture

Owner Decision: Platform **1.2.0** is the **repository-certified baseline** after Wave 1, Wave 2, remediation, punch list, final portfolio certification train, and visual certification review.

Formal CERT-003 gate string remains historically **CERTIFICATION FAILED** (visual hard fail at that instant). CERT-004 **ACCEPTED** closes that residual without application engineering. Release classification for freeze: **PRODUCTION READY WITH LIMITATIONS**.
