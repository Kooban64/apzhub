# APZ Law — Operational Roles

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T201500Z |

| Role                    | Responsibilities                                                                                                           | Inputs                             | Outputs                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------- |
| **Developer**           | Implement authorised changes; open/maintain Quality Flow; keep Governance Companion intact; complete Engineering checklist | Backlog item; Owner Auth; Flow     | Code; tests; Engineering checklist |
| **QA**                  | Validate quality gates; vocabulary/identity regression; practice separation; complete Quality checklist                    | Flow; build; Engineering checklist | Quality checklist; defects         |
| **Product Owner**       | Protect product contract (APZHUB governance); refuse practice/legal-SaaS scope; prioritise APZHUB governance needs         | Requests; Known Limitations; Auth  | Scoped backlog; scope decisions    |
| **Engineering Manager** | Enforce Flow discipline; evidence completeness; metrics hygiene                                                            | Flows; checklists; metrics         | Flow health; coaching; escalations |
| **Operations**          | Production care; practice tooling ops; operational review                                                                  | Health signals; release packs      | Ops confirmation; incidents        |
| **Product Board**       | Authorise programmes/releases of material scope; accept strategy                                                           | Decision Packages; evidence        | Authorisations; acceptances        |

## Escalation

| Situation                                          | Escalate to                                         |
| -------------------------------------------------- | --------------------------------------------------- |
| Scope creep / practice-as-product outside Auth     | Product Owner → Product Board                       |
| Request to become law-firm / commercial legal SaaS | Product Owner → **refuse** (permanent out of scope) |
| Quality Flow blocked                               | Engineering Manager                                 |
| Suspected architecture change needed               | Product Board (do not implement)                    |
| Practice-first / legal-advice leakage in UX        | QA + Product Owner (block release)                  |
