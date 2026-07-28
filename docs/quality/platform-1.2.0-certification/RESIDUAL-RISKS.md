# APZHUB-QA-CERT-003 — Residual Risks

> **Programme:** APZHUB-QA-CERT-003  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Note:** Factual residual inventory only — no engineering recommendations

---

## Hard residual

| ID           | Risk                                                                | Severity | Observed fact                                              |
| ------------ | ------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| CERT3-PW-001 | Support analytics visual baseline does not match committed snapshot | Medium   | Expected 1280×928; received 1280×1064; failed 3/3 attempts |

## Flaky residuals (passed on retry)

| Area                                   | Risk                                                         | Severity   |
| -------------------------------------- | ------------------------------------------------------------ | ---------- |
| Notifications workbench                | Intermittent strict-mode locator collision on notice text    | Low        |
| TCMS workbench / HTTP / EI / executive | Intermittent page-shell / dashboard activation timing        | Low–Medium |
| Support Soft performance baseline      | Intermittent detail-view readiness under Soft timing harness | Low        |

## Non-residuals (cleared vs QA-CERT-002 punch list)

Lint, Zammad capability Vitest, Law DX routes, Analytics/Projects/Time/Config navigation, SPR-003 persistence — **did not recur as hard failures** in this run.

## Platform limitation residuals (documented, not suite failures)

PL12-KL-07 Email SoR absent · PL12-KL-08 FIN-001 not extracted · PL12-KL-09 Workflow Execute gated — unchanged Known Limitations.
