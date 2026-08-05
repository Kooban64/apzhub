# APZ Time — Operational Roles

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T034500Z |

No role ambiguity: each role has responsibilities, inputs, and outputs.

| Role                    | Responsibilities                                                                                                | Inputs                             | Outputs                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- |
| **Developer**           | Implement authorised changes; open/maintain Quality Flow; keep engine invisible; complete Engineering checklist | Backlog item; Owner Auth; Flow     | Code; tests; Engineering checklist |
| **QA**                  | Validate quality gates; leakage/regression; complete Quality checklist                                          | Flow; build; Engineering checklist | Quality checklist; defects         |
| **Product Owner**       | Protect product contract; refuse unauthorised scope; prioritise backlog                                         | Requests; Known Limitations; Auth  | Scoped backlog; scope decisions    |
| **Engineering Manager** | Enforce Flow discipline; evidence completeness; metrics hygiene                                                 | Flows; checklists; metrics         | Flow health; coaching; escalations |
| **Operations**          | Production care; health/readiness; operational review                                                           | Health signals; release packs      | Ops confirmation; incidents        |
| **Product Board**       | Authorise programmes/releases of material scope; accept strategy                                                | Decision Packages; evidence        | Authorisations; acceptances        |

## Escalation

| Situation                                  | Escalate to                        |
| ------------------------------------------ | ---------------------------------- |
| Scope creep / feature request outside Auth | Product Owner → Product Board      |
| Quality Flow blocked                       | Engineering Manager                |
| Suspected architecture change needed       | Product Board (do not implement)   |
| Engine leakage in UX                       | QA + Product Owner (block release) |
