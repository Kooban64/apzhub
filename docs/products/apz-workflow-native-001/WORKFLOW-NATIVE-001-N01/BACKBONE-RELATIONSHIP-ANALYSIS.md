# Backbone Relationship Analysis — APZ Workflow × RI #001–#004

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-01             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T163000Z |

## Expected (mission)

Workflow orchestrates how work moves across:

| RI   | Product       | Example journey step        |
| ---- | ------------- | --------------------------- |
| #003 | APZ Projects  | Create / advance work item  |
| #002 | APZ Support   | Open / advance service work |
| #001 | APZ Time      | Create time activity        |
| #004 | APZ Documents | Attach / require documents  |

Plus quality review via APZQEP — without Workflow owning those SoRs.

## Observed

| Check                                  | Result                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| Journey UX referencing Projects        | **Absent**                                                                       |
| Journey UX referencing Support         | **Absent**                                                                       |
| Journey UX referencing Time            | **Absent**                                                                       |
| Journey UX referencing Documents       | Minimal (documents work-context kind `workflow` exists in lib; not a journey UX) |
| Business-named cross-product templates | **Absent**                                                                       |

## Result

**GAPS IDENTIFIED.** The strategic value of Workflow (multiplying the backbone) is not yet expressed in the product experience. Record for N-03+; do not invent platform programmes from this gap alone.
