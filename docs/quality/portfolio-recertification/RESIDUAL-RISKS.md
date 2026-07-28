# APZHUB-QA-CERT-001 — Residual Risks

> **Programme:** APZHUB-QA-CERT-001  
> **Date:** 2026-07-21  
> **Honesty:** Residuals are certified as open risks — not silent GA.

---

## P0 / P1 residual themes

| Risk                                    | Evidence                                                                                 | Severity            |
| --------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------- |
| Auth/shell hydration instability        | 30 flaky + several spr-003 hard fails; Better Auth “Invalid password” noise during suite | High                |
| Law Trust E2E on main Playwright config | 7× `law-015-trust-workflow` hard fails                                                   | High                |
| Support UI residual cert gaps           | OSS-110-13/14 error-mapping, keyboard, request lifecycle                                 | Medium–High         |
| Observe workbench full journey          | `apzobserve-004` manifest journey hard fail                                              | Medium              |
| Inbox visual baseline drift             | `support-inbox` screenshot fail (detail/analytics remediated in ENG-0015)                | Low–Medium          |
| Host Vitest / lint / typecheck debt     | 82 Vitest fails; Law lint/typecheck                                                      | High for CI honesty |

---

## Closed remediation engineering (not residual OPEN groups)

Orders 1–6 remediation groups ENG-0006…0015 are **REMEDIATED**. Residual failures above are **outside** those closed member sets (or adjacent surfaces) and require **new** Owner-authorised programmes — not silent fixes under QA-CERT-001.

---

## Risk statement

Platform **1.2.0** remains **PRODUCTION_READY_WITH_LIMITATIONS**. Portfolio CI green bar is **not** restored. Do not market full portfolio Playwright green.
