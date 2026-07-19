# APZ Support — Risk Review (Release 2.0 Planning)

> **Programme:** APZ Support Release **2.0** Planning  
> **Classification:** DOCUMENTATION ONLY  
> **Related:** [Readiness Assessment](./APZ-SUPPORT-2.0-READINESS-ASSESSMENT.md) · [Gaps](./APZ-SUPPORT-IMPLEMENTATION-GAPS.md)  
> **Date:** 2026-07-19

---

## Risk posture

Support’s Production certification (with limitations) reduces greenfield stack risk. Primary risks for “Release 2.0” planning are **false Major-scope**, **rebuilding delivered UI**, and **treating IR as the gate**.

---

## Active risks

| ID    | Risk                                                                       | Likelihood | Impact   | Class                | Mitigation                                      |
| ----- | -------------------------------------------------------------------------- | ---------- | -------- | -------------------- | ----------------------------------------------- |
| SR-01 | Treating Support as pre-IR and “promoting to IR”                           | Medium     | High     | Governance falsehood | Explicit verdict: already Production / past IR  |
| SR-02 | Rebuilding ticket Workbench as 2.0 Phase 1                                 | Medium     | Critical | Wasted delivery      | Gap register marks ticket spine as delivered    |
| SR-03 | Claiming SemVer **2.0.0** without packaging baseline                       | Medium     | High     | Release honesty      | Close S2-01 first or Owner-explicit versioning  |
| SR-04 | Stacking Event Bus + webhooks + attachments + notifications in one Phase 1 | Medium     | High     | Delivery slip        | Owner picks ≤1 limitation track for Phase 1     |
| SR-05 | Breaking Zammad **0.6.0** / Integration SDK **1.0.0** freezes              | Low        | Critical | Architecture defect  | Consume frozen packages; ADR + Owner for breaks |
| SR-06 | Module → Connector bypass in any new work                                  | Low        | Critical | Layer violation      | HTTP → Platform Services → adapter only         |
| SR-07 | Exposing Zammad branding in UI                                             | Low        | High     | Product integrity    | Existing brand-mask rules                       |
| SR-08 | Confusing platform Notifications SoR with Support vertical wiring          | Medium     | Medium   | Scope creep          | KNOWN-LIMITATIONS honesty                       |
| SR-09 | Starting implementation from planning Acceptance alone                     | Medium     | High     | Process defect       | DoR: named programme Approval + Sprint Guide    |
| SR-10 | Operational PARTIAL mistaken for “not Production”                          | Medium     | Medium   | Maturity confusion   | Retain Production + limitations                 |

---

## Residual risk if recommendations followed

| Residual                                                                      | Acceptable?                             |
| ----------------------------------------------------------------------------- | --------------------------------------- |
| Support remains Production with documented limitations while 2.0 is unplanned | **Yes**                                 |
| Major 2.0 may be thinner than all gap closures                                | **Yes** — honesty over feature pressure |
| Health/diagnostics Workbench parity deferred                                  | **Yes** if Owner prioritises packaging  |

---

## Risk to recommendation

Primary risk if Owner ignores assessment: **authorising a “2.0” that rebuilds existing ticket UI** or **claims IR promotion**. Recommendation blocks both.
