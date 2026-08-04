# RISK-REGISTER — APZQEP-165-PLAN

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-PLAN  |
| Timestamp | 20260804T060307Z |

| ID       | Risk                                               | Class                   | Impact   | Likelihood | Mitigation                                             |
| -------- | -------------------------------------------------- | ----------------------- | -------- | ---------- | ------------------------------------------------------ |
| R-165-01 | Monolithic Cursor pass recreates unreviewable diff | Technical / Governance  | High     | Med        | Slice Owner Auth only; S01 first                       |
| R-165-02 | Orchestration absorbs peer SoR                     | Technical / Governance  | High     | Med        | Contract tests; boundary checklist each slice          |
| R-165-03 | Process-local run state shipped as production      | Technical / Operational | High     | Med        | S04 durable-state acceptance; S18 verifies             |
| R-165-04 | Peer platform API drift (Automation/SCM/QI)        | Dependency              | High     | Med        | Contract freeze + fakes; integration slices isolated   |
| R-165-05 | Approval/authz defect enables silent GO            | Security / Governance   | Critical | Low        | S08 security review; fail-closed; no superadmin bypass |
| R-165-06 | Event dual-bus temptation                          | Technical               | Med      | Low        | S10 reuses outbox only; cert blocks second bus         |
| R-165-07 | UX owns gate thresholds                            | Governance              | High     | Med        | S15/S17 presentation-only checklist                    |
| R-165-08 | Slice dependency thrash / rework                   | Dependency              | Med      | Med        | Critical path discipline; no skip of S04               |
| R-165-09 | Regression of Waves 1–4 CI                         | Certification           | High     | Med        | Wave regression in S11–S15 and S18                     |
| R-165-10 | 165R entered without ops runbooks                  | Operational             | Med      | Med        | OPERATIONAL-READINESS-PLAN entry criteria              |
| R-165-11 | Scope creep into CI/CD product                     | Governance              | High     | Low        | Explicit exclusion; Board stop condition               |
| R-165-12 | Provider programmes sneak into 165                 | Governance              | Med      | Low        | 163A/B/C separate auth only                            |

No risk authorises architecture change under this plan.
