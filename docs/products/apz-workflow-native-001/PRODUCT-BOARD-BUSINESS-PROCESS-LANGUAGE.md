# Product Board Principle — Business Process Language (Workflow)

| Field     | Value                           |
| --------- | ------------------------------- |
| Programme | APZ-WORKFLOW-NATIVE-001         |
| Status    | **IN FORCE**                    |
| Timestamp | 20260805T164500Z                |
| Authority | Product Board (pre N-02)        |
| Gate      | **Recorded before N-02 begins** |

## Companion principles

> **The user should design a business process, not configure an automation engine.**

> **Users compose business outcomes. The platform determines execution.**

These strengthen the Intent Principle:

> A workflow describes what the business intends to happen. It does not prescribe how technology makes it happen.

## Product Board directive (identity)

> **Identity shall be expressed entirely in business process language. Any vocabulary that implies automation implementation belongs below the product boundary and shall not define the user experience.**

## Allowed product vocabulary

| Prefer      |
| ----------- |
| Process     |
| Stage       |
| Step        |
| Participant |
| Decision    |
| Approval    |
| Outcome     |
| Escalation  |
| Exception   |

## Forbidden as product UX vocabulary

| Avoid (belongs below the product boundary) |
| ------------------------------------------ |
| Trigger                                    |
| Node                                       |
| Execution                                  |
| Webhook                                    |
| Schedule                                   |
| Provider                                   |
| Engine                                     |
| Run                                        |

## Layer protection

```text
Business
   ↓
Workflow          ← user lives here (business process language)
   ↓
Automation        ← execution (invisible)
   ↓
Provider          ← implementation (invisible)
```

If the user sees Automation concepts inside Workflow, two layers have collapsed. That is an identity defect.

## Slice application

| Slice    | Application                                                                 |
| -------- | --------------------------------------------------------------------------- |
| **N-02** | Session/RBAC + hide execution/engine identity surfaces from default product |
| **N-03** | Full chrome / experience speaks only business process language              |
| **N-04** | Ops language remains business-intent                                        |

Related: [PRODUCT-BOARD-INTENT-PRINCIPLE.md](./PRODUCT-BOARD-INTENT-PRINCIPLE.md) · [PRODUCT-VOCABULARY.md](./PRODUCT-VOCABULARY.md)
