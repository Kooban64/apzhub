# APZ Analytics — Operational Roles

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T184500Z |

| Role                    | Responsibilities                                                                                                         | Inputs                             | Outputs                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ---------------------------------- |
| **Developer**           | Implement authorised changes; open/maintain Quality Flow; keep Decision Companion intact; complete Engineering checklist | Backlog item; Owner Auth; Flow     | Code; tests; Engineering checklist |
| **QA**                  | Validate quality gates; vocabulary/identity regression; admin separation; complete Quality checklist                     | Flow; build; Engineering checklist | Quality checklist; defects         |
| **Product Owner**       | Protect product contract (Decision Companion); refuse reporting-as-product scope; prioritise backlog                     | Requests; Known Limitations; Auth  | Scoped backlog; scope decisions    |
| **Engineering Manager** | Enforce Flow discipline; evidence completeness; metrics hygiene                                                          | Flows; checklists; metrics         | Flow health; coaching; escalations |
| **Operations**          | Production care; admin tooling; operational review                                                                       | Health signals; release packs      | Ops confirmation; incidents        |
| **Product Board**       | Authorise programmes/releases of material scope; accept strategy                                                         | Decision Packages; evidence        | Authorisations; acceptances        |

## Escalation

| Situation                                       | Escalate to                        |
| ----------------------------------------------- | ---------------------------------- |
| Scope creep / reporting-as-product outside Auth | Product Owner → Product Board      |
| Quality Flow blocked                            | Engineering Manager                |
| Suspected architecture change needed            | Product Board (do not implement)   |
| Dashboard-first / BI engine leakage in UX       | QA + Product Owner (block release) |
