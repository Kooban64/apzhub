# API-ARCHITECTURE — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Principles

- Provider-neutral, versioned REST-first APIs via APZHUB API Gateway
- Auth, authz, validation, audit, correlation ID on every endpoint
- Standard response envelope
- No backend engine details in errors

## API groups (architecture)

| Group                   | Examples (conceptual)                                  |
| ----------------------- | ------------------------------------------------------ |
| Capability registration | Register / list / get / deprecate capability contracts |
| Flow registration       | CRUD Quality Flow definitions (versioned)              |
| Flow execution          | Start / cancel / retry flow runs                       |
| Flow state              | Get run, list runs, step details                       |
| Flow history / audit    | Immutable history queries                              |
| Policy lookup           | Selection / gate / approval / retry policies           |
| Gate evaluation         | Read gate results; request re-evaluate (permissioned)  |
| Approval requests       | List pending; approve; reject; delegate                |
| Release decisions       | Recommend; decide; get decision; search                |
| Trigger bindings        | Manage trigger → flow bindings                         |

## Illustrative path prefix

```text
/api/v1/orchestration/...
```

Exact paths deferred to APZQEP-165 engineering OpenAPI. Architecture requires grouping above.

## Non-API surfaces

- Command Palette → same Platform Service operations
- Notification actions → same Platform Service operations
- No public connector APIs for orchestration consumers
