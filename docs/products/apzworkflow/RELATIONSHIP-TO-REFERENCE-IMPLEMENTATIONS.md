# APZ Workflow — Relationship to Reference Implementations

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZ-WORKFLOW-000 |
| Status    | **APPROVED**     |
| Timestamp | 20260805T163000Z |

## Operational backbone (already earned)

| RI   | Product       | Enterprise capability  | Workflow relationship                         |
| ---- | ------------- | ---------------------- | --------------------------------------------- |
| #001 | APZ Time      | Workforce Productivity | Journey steps may create/reference time work  |
| #002 | APZ Support   | Service Management     | Journey steps may open/advance service work   |
| #003 | APZ Projects  | Project Delivery       | Journey steps may create/advance project work |
| #004 | APZ Documents | Document Management    | Journey steps may attach/require documents    |

APZQEP remains the quality/release baseline for changes — including Workflow itself after Native Adoption. Workflow does not replace APZQEP.

## Illustrative journey (intent only)

```text
Project Approved
        │
        ▼
Create Work Item          → APZ Projects (SoR)
        │
        ▼
Assign Owner              → APZ Projects / platform identity
        │
        ▼
Attach Documents          → APZ Documents (SoR)
        │
        ▼
Create Time Activity      → APZ Time (SoR)
        │
        ▼
Quality Review            → APZQEP (quality path)
        │
        ▼
Complete
```

Workflow owns the **journey**. Each product owns its **datum**.

## Strategic implication

Workflow is **business capability expansion** on a proven foundation. It is not an effort to complete the platform or to re-prove the Native Adoption methodology.
