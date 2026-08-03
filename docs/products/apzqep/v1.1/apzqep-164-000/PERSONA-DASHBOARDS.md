# PERSONA-DASHBOARDS — APZQEP-164-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-164-000   |
| Timestamp | 20260803T191002Z |

## Persona → dashboard mapping

| Persona             | Primary dashboards                 | Key widgets                                                        |
| ------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| Executive           | Executive, Portfolio, Release      | Overall quality, readiness, risk heatmap, top recommendations      |
| Engineering Manager | Engineering, Project, Automation   | Failure trends, automation health, SCM activity, defect recurrence |
| QA Lead             | QA, Evidence, QI, Release          | Coverage, evidence completeness, signals, regression status        |
| Tester              | QA, Evidence, Execution            | Session status, evidence gaps, assigned recommendations            |
| Developer           | Engineering, Repository, Project   | Repo timeline, failing tests, linked defects, churn signals        |
| Release Manager     | Release, Compliance, QI            | Gates, outstanding defects, certification readiness                |
| Support             | Operations (limited), Project      | Incident-linked quality context (permissioned)                     |
| Operations          | Operations, Automation, Repository | Provider status, job health, sync/webhook posture                  |
| Administrator       | Operations, Compliance             | Config health, audit timelines (superadmin tier distinct)          |
| Product Board       | Executive / Compliance (read)      | Certification readiness, residual issues, score trends             |

## Permission model

- Personas are **presentation presets**, not security roles.
- Server-side PermissionService remains authoritative.
- Superadmin is a special tier (007) — distinct surfaces, audited, not a bypass.

## Dashboard domains (full set)

Executive · Engineering · QA · Project · Portfolio · Operations · Release · Compliance · Automation · Repository · Evidence · Quality Intelligence
