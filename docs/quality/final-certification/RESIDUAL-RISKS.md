# APZHUB-QA-CERT-002 — Residual Risks

> **Programme:** APZHUB-QA-CERT-002  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21

---

## Risk register (certification snapshot)

| ID          | Risk                                                                                         | Severity | Evidence             |
| ----------- | -------------------------------------------------------------------------------------------- | -------- | -------------------- |
| RR-CERT2-01 | Lint gate red — workflow foundation audit script escape hygiene                              | Low      | `pnpm lint` 2 errors |
| RR-CERT2-02 | Vitest red — Zammad core capability count drift (11 vs 12)                                   | Medium   | 1 Vitest failure     |
| RR-CERT2-03 | Playwright Law API developer-experience endpoints failing (OpenAPI YAML/JSON, guide, health) | Medium   | 4 hard fails         |
| RR-CERT2-04 | Product workbench E2E residuals (Projects, Time×2, Analytics, Configuration)                 | Medium   | 5 hard fails         |
| RR-CERT2-05 | SPR-003 workbench context persistence assertion still unstable under full suite              | Medium   | 1 hard fail          |
| RR-CERT2-06 | Support performance baseline Soft timing remains flaky                                       | Low      | 1 flaky              |

## Explicitly closed by Wave 2 (not in this hard-fail set)

Wave 2 repository-approved residual groups (Law suite/host/authz/search, cert pins, auth/shell, Support cert, Observe, Visual inbox, Testing-arch) are **REMEDIATED** and did not reappear as the dominant hard-fail cluster in QA-CERT-002.

## Authority

Further remediation requires a **new** Owner-approved analysis/engineering programme. This certification programme authorises **no** fixes.
