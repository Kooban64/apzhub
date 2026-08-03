# QUALITY-DATA-MODEL

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-160       |
| Timestamp | 20260803T141613Z |

## Intent

One coherent quality data model spanning Version 1.0 domains and Version 1.1 orchestration artefacts.

## Core entities (conceptual)

| Entity                   | Role                                    |
| ------------------------ | --------------------------------------- |
| Requirement / Spec link  | Traceability source                     |
| Test case / suite / plan | Design & planning                       |
| Execution / run          | Manual or automated attempt             |
| Runner job               | Engine-specific unit of work            |
| Evidence artefact        | Immutable proof (logs, traces, reports) |
| Defect / observation     | Quality finding                         |
| Quality score            | Derived readiness / gate input          |
| Integration event        | SCM/CI webhook normalised               |
| AI advice                | Advisory artefact with audit            |

## Rules

1. Platform Postgres owns metadata/SoR per 011; engines own ephemeral runner state.
2. Derived indexes (search, dashboards) never become authoritative.
3. Tenant / project scoping mandatory.
4. Correlation IDs end-to-end (010/012/029).

## Version 1.0

Preserve Caps A–F persistence and RBAC. Version 1.1 extends schema via authorised engineering programmes only.
