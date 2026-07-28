# Release 1.2 — Technical Debt Register

> **Programme:** APZHUB-1.2-001  
> **Date:** 2026-07-20  
> **Inherits themes from:** [1.1-planning/TECHNICAL-DEBT.md](../1.1-planning/TECHNICAL-DEBT.md)

---

| ID       | Debt                                              | Classification             | Priority | 1.2 action                                             |
| -------- | ------------------------------------------------- | -------------------------- | -------- | ------------------------------------------------------ |
| TD-12-01 | Automation journal not Postgres SoR               | Technical Debt             | P1       | **Closed under APZHUB-ENG-0001** (Awaiting Acceptance) |
| TD-12-02 | Law session stores not Postgres SoR               | Technical Debt             | P1       | **Closed under APZHUB-ENG-0002** (Awaiting Acceptance) |
| TD-12-03 | Missing `search-time` / `search-law` publishers   | Platform Capability gap    | P0       | SEARCH-01/02                                           |
| TD-12-04 | Root version `0.1.0-foundation` vs platform 1.1.0 | Developer Experience       | P2       | SEMVER-01                                              |
| TD-12-05 | Intentional QA stubs                              | Technical Debt             | P3       | QA-02                                                  |
| TD-12-06 | Event Bus / outbox still MVP 0.1.0                | Technical Debt             | P3       | Maintain; expand only if needed                        |
| TD-12-07 | Provisioning MVP                                  | Technical Debt             | P3       | Future unless blocker                                  |
| TD-12-08 | Analytics registry not Postgres SoR               | Technical Debt             | —        | 1.3 (AN-01)                                            |
| TD-12-09 | Notification delivery absent                      | Deferred / Future Platform | —        | NOTIFY-01 later                                        |

## Debt rules

1. Do not use “debt cleanup” to smuggle STOP themes.
2. Prefer closing honesty gaps (SoR claims) over greenfield features.
3. Integration SDK remains frozen — adapters extend, core does not rewrite.
