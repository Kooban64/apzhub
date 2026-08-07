# Product Board Principle — Workflow Intent vs Execution

| Field     | Value                                              |
| --------- | -------------------------------------------------- |
| Programme | APZ-WORKFLOW-NATIVE-001                            |
| Status    | **IN FORCE**                                       |
| Timestamp | 20260805T163000Z                                   |
| Authority | Product Board / Owner Approval of APZ-WORKFLOW-000 |
| Gate      | **Recorded before N-01 starts**                    |

## Principle

> **A workflow describes what the business intends to happen. It does not prescribe how technology makes it happen.**

## Companion distinctions

| Question             | Owner                                                   |
| -------------------- | ------------------------------------------------------- |
| What should happen?  | **APZ Workflow** (business intent)                      |
| What runs?           | Automation / execution (invisible implementation)       |
| Who decides quality? | **APZQEP**                                              |
| Who owns the datum?  | Domain products (Projects, Support, Time, Documents, …) |

## Standing stack

```text
APZQEP          → decides
APZ Workflow    → coordinates business intent
Automation      → executes
Products        → own business data
```

## The Workflow Test (mandatory)

> Can the business describe this workflow without mentioning software?

Passes: employee onboarding, customer complaint handling, project approval, procurement request, leave approval, quality review, contract approval.  
Fails: trigger webhook, run automation, execute provider, call API.

Full face: [../apzworkflow/WORKFLOW-TEST.md](../apzworkflow/WORKFLOW-TEST.md)

## Product identity reminder

APZ Workflow **is** the enterprise product that models, governs and visualises business processes.

It is **not** an automation engine, integration platform, event bus, rules engine, or scheduler.

## Slice application

| Slice    | How this principle applies                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------- |
| **N-01** | Audit for intent vs execution conflation; engine Activity Bar leakage; Workflow Test failures in labels   |
| **N-02** | Identity reinforces one APZHUB session; engine/execution admin gated; business-process language directive |
| **N-03** | Experience presents business processes — not runs/providers/engines as the mental model                   |
| **N-04** | Ops language stays business-intent; execution remains behind the curtain                                  |

Companion (pre N-02): [PRODUCT-BOARD-BUSINESS-PROCESS-LANGUAGE.md](./PRODUCT-BOARD-BUSINESS-PROCESS-LANGUAGE.md)

Source: Owner Approval of APZ-WORKFLOW-000 — record before Native Adoption N-01.
