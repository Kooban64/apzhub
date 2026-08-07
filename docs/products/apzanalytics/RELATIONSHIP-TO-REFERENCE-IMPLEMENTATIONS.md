# APZ Analytics — Relationship to Reference Implementations

| Field     | Value                          |
| --------- | ------------------------------ |
| Programme | APZ-ANALYTICS-000 / NATIVE-001 |
| Status    | **RI #006 DECLARED**           |
| Timestamp | 20260805T184500Z               |

## Enterprise Productivity Core

| RI   | Product       | Enterprise capability           | Analytics relationship                                     |
| ---- | ------------- | ------------------------------- | ---------------------------------------------------------- |
| #001 | APZ Time      | Work Execution                  | Observes effort — answers “where is effort spent?”         |
| #002 | APZ Support   | Service Operations              | Observes service — answers repeat-incident / SLA questions |
| #003 | APZ Projects  | Project Delivery                | Observes delivery — answers health / risk / blockage       |
| #004 | APZ Documents | Enterprise Information          | Observes document context where relevant to insight        |
| #005 | APZ Workflow  | Business Process Governance     | Observes journeys — answers delay / process questions      |
| #006 | APZ Analytics | **Enterprise Decision Support** | Decision Companion — Question → Insight → Decision         |

APZQEP remains the quality/release baseline. Analytics may ask “are releases becoming safer?” by observing quality signals — it does not replace APZQEP.

## Layer distinction

```text
Enterprise Productivity Core (RI #001–#005 operational + #006 insight)
        │  do the work / understand the work
        ▼
Decisions
```

Analytics multiplies the operational RIs; it does not own their Systems of Record.

## Strategic implication

Analytics completes the **Enterprise Productivity Core**. Future products plug into this core — they do not redefine the platform. See [../framework/APZHUB-ENTERPRISE-PRODUCTIVITY-CORE.md](../framework/APZHUB-ENTERPRISE-PRODUCTIVITY-CORE.md).
