# APZ Workflow — Product Vocabulary (Identity Law)

| Field     | Value                                                                                      |
| --------- | ------------------------------------------------------------------------------------------ |
| Programme | APZ-WORKFLOW-NATIVE-001                                                                    |
| Status    | **IN FORCE**                                                                               |
| Timestamp | 20260805T164500Z                                                                           |
| Authority | [PRODUCT-BOARD-BUSINESS-PROCESS-LANGUAGE.md](./PRODUCT-BOARD-BUSINESS-PROCESS-LANGUAGE.md) |

## Rule

User-facing APZ Workflow identity uses **business process language** only.

Implementation keys (`workflow.runs.*`, `workflow.engine.*`, …) may exist below the product boundary. They must not define the default user experience or Activity Bar product identity.

## Mapping (guidance for Native Adoption)

| Business (product)  | Implementation (below boundary)  |
| ------------------- | -------------------------------- |
| Process             | workflow definition / SoR entity |
| Stage / Step        | definition structure             |
| Participant         | task assignee                    |
| Decision / Approval | task approve / decision point    |
| Outcome             | terminal business result         |
| Escalation          | exception path                   |
| Exception           | failed / blocked business path   |
| _(not shown)_       | run, schedule, provider, engine  |

## N-02 enforcement

Default Tenant Member identity may reach **business process** surfaces.  
**Execution and engine** surfaces require `workflow.admin` (operator identity) — not the default product identity.
