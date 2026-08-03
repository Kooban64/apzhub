# API-ARCHITECTURE — APZQEP-163-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-163-000   |
| Timestamp | 20260803T175516Z |

## Base path (proposed)

```text
/api/v1/qep/quality-intelligence
```

Provider-neutral. No OpenAI/Claude/Gemini request shapes externally.

## Resource families

| Family            | Operations (conceptual)                 |
| ----------------- | --------------------------------------- |
| Recommendations   | list, get, accept, reject, override     |
| Quality Scores    | list, get, latest, trend                |
| Risk              | list, get, assess (async)               |
| Predictions       | list, get                               |
| Providers         | list, connect/validate, health          |
| Provider runs     | list, get (audit)                       |
| Explanations      | get by explanationId / outcomeId        |
| Confidence        | get distribution / caps for outcome     |
| Release readiness | get latest advice for release candidate |
| Domains           | catalogue of intelligence domains       |

## Cross-cutting

| Concern         | Design                                               |
| --------------- | ---------------------------------------------------- |
| Auth / Authz    | Platform API auth + PermissionService                |
| Correlation IDs | End-to-end                                           |
| Async work      | Long analyses via jobs/events — not request blocking |
| Errors          | Typed envelope; no vendor error leakage              |
| Audit           | Mutating actions audited                             |

## Explicit non-implementation

No Route Handlers or packages created in APZQEP-163-000.
