# Operating Model — APZ-WORKFLOW-NATIVE-001-N04

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T171000Z |

## Rule

Every future APZ Workflow change operates under APZQEP:

```text
Request → Quality Flow → Impact → Policy → Decision Package → Evidence → Release → Operational Learning
```

## Permanent Workflow operational principles

| Principle                                            | Meaning                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| Workflow governs **business intent**                 | Product owns process definition, governance, visualisation |
| Automation **executes** approved intent              | Execution remains below the product boundary               |
| Operational tooling supports **administrators only** | Operator tools never define the primary experience         |
| Business users never need execution mechanics        | Journeys, processes, outcomes, participants, approvals     |

## Product contract preserved

| Layer                          | Owner                    |
| ------------------------------ | ------------------------ |
| Business process companion UX  | N-03 baseline (frozen)   |
| Identity / RBAC                | N-02 baseline (frozen)   |
| Intent / vocabulary principles | Product Board (IN FORCE) |
| Quality / release              | APZQEP V1.1              |

Canonical ops pack: [../../apzworkflow/](../../apzworkflow/)
