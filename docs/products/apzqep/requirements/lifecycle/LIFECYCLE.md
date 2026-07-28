# Lifecycle Overview

ENG-020C delivers a **reusable** lifecycle framework configured by Requirements. Verification, Execution, Evidence, and other QEP modules can adopt the same `@apzhub/lifecycle-engine` package later.

## Scope delivered

- Generic lifecycle engine (policy, validator, transitions, history entry builder)
- Expanded requirement statuses: `draft`, `proposed`, `in_review`, `approved`, `rejected`, `implemented`, `verified`, `deprecated`, `archived`
- Requirements lifecycle policy and application transitions
- Lifecycle history persistence (`qep_requirement_lifecycle_history`)
- Domain events for each major transition
- Platform service methods, HTTP API, and UI action buttons
- Reporting stub: `summariseRequirementLifecycle`

## Out of scope (explicit)

- Multi-stage approval workflows
- Baselines and version comparison
- Relationships, import/export, AI, MCP
- Bulk operations
- Workflow orchestration engine

## Request flow

```
Client → API → Platform Service → Application Service → LifecycleEngine → Repository
                                      ↓
                              History + Audit + Domain Event + Search
```

Status changes are **never** applied via `updateRequirement`; only lifecycle transition methods may change status.
