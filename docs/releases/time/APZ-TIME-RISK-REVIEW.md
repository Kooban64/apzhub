# APZ Time — Risk Review (Readiness Reassessment)

> **Programme:** APZHUB-TIME-READINESS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Related:** Prior [APZ-TIME-1.0-RISK-ASSESSMENT.md](./APZ-TIME-1.0-RISK-ASSESSMENT.md) · [Gaps](./APZ-TIME-IMPLEMENTATION-GAPS.md)  
> **Date:** 2026-07-19

---

## Risk posture update

Stack layers (Kimai foundation, Platform Services, HTTP) reduced **false-readiness risk from “total stack absent”**, but introduced a new honesty risk: treating limited certifications as product IR.

---

## Active risks

| ID    | Risk                                                                 | Likelihood       | Impact   | Class                | Mitigation                                              |
| ----- | -------------------------------------------------------------------- | ---------------- | -------- | -------------------- | ------------------------------------------------------- |
| RR-01 | Declaring Implementation Ready despite Kimai domain **501**          | Medium if rushed | Critical | False readiness      | Keep Planning until IR-01/IR-02 closed                  |
| RR-02 | Starting Workbench against in-memory or 501 path                     | Medium           | Critical | Architecture defect  | Enforce domain SoR before P1; no Workbench Approval yet |
| RR-03 | Expanding Kimai without ADR / CE capability discovery                | Medium           | High     | Integration defect   | ADR + Integration SDK 1.0.0 only; no SDK redesign       |
| RR-04 | Confusing foundation Kimai cert with Time product cert               | Medium           | High     | Governance           | CERTIFIED_FOUNDATION ≠ product                          |
| RR-05 | Coupling Time UI to Plane/Projects internals                         | Medium           | High     | Layer violation      | HTTP `/api/v1/time/*` only; no module coupling          |
| RR-06 | Scope creep (approvals/reporting/analytics) into first product slice | Medium           | Medium   | Delivery slip        | Keep deferred until after thin vertical                 |
| RR-07 | Breaking Integration SDK / Plane / Projects freezes                  | Low              | Critical | Governance           | Consume frozen packages; no redesign                    |
| RR-08 | Duplicating timesheet SoR into platform PostgreSQL                   | Medium           | High     | Data integrity (011) | Kimai remains SoR for entries when domain lands         |
| RR-09 | Skipping audit/events on time mutations                              | Medium           | Medium   | Compliance           | Platform Services publish; modules do not notify        |
| RR-10 | Host Kimai ops mistaken for adapter completeness                     | Low              | Medium   | Ops confusion        | ENVIRONMENT.md ≠ Integration                            |
| RR-11 | Stale pack docs causing agents to invent work                        | Medium           | Medium   | Process              | This programme refreshes readiness docs                 |
| RR-12 | Owner override to IR “with limitations” without domain               | Low–Medium       | High     | Product debt         | Explicitly not recommended                              |

---

## Residual risk if recommendation followed

| Residual                                              | Acceptable?                             |
| ----------------------------------------------------- | --------------------------------------- |
| APZ Time remains Planning while platform layers exist | **Yes** — honest                        |
| Future domain expansion may constrain CAPABILITIES    | **Yes** — discover against CE           |
| First product release may be thinner than full pack   | **Yes** — honesty over feature pressure |

---

## Risk to recommendation

Primary risk if Owner ignores reassessment: **product Workbench on a 501/in-memory path**, creating throwaway UI and architecture debt. Recommendation blocks product implementation until IR.
