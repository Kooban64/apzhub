# API-ARCHITECTURE — APZQEP-164-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-164-000   |
| Timestamp | 20260803T191002Z |

## Principle

Provider-neutral, gateway-mediated APIs (010). Dashboard APIs manage **experience metadata and read projections** — not engine SoR writes except authorised actions already owned by domain platforms.

## Intended API groups (design only)

Base (illustrative): `/api/v1/qep/dashboards`

| Group                   | Operations                                       |
| ----------------------- | ------------------------------------------------ |
| Dashboard metadata      | List/get dashboards, widgets, permissions        |
| Widgets                 | Widget descriptors + bound data query ids        |
| Metrics / Trends        | Projection queries (aggregates)                  |
| Filters                 | Shared filter schemas (tenant, project, time)    |
| Saved layouts           | CRUD on user/org saved views (platform metadata) |
| Dashboard configuration | Admin config (roles, default landings)           |
| Visualization metadata  | Chart/timeline viewer descriptors                |

## Data path

```text
Client → API Gateway → Auth → Authz → Platform Service (Dashboard/Projection)
        → (reads) Automation / SCM / Evidence / QI / Reporting / …
        → standard response envelope
```

No client → connector → engine path.

## Explicit non-APIs

- No OpenAI/Claude endpoints
- No dashboard score mutation endpoints
- No duplicate Evidence upload APIs
