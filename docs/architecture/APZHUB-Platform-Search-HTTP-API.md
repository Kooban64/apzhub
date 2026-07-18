# Platform Search HTTP API (APZSEARCH-007)

Canonical HTTP surface over `PlatformServiceGateway` Search facets.

## Query plane

| Method | Path                            | Gateway                                      |
| ------ | ------------------------------- | -------------------------------------------- |
| POST   | `/api/v1/search/query`          | `searchExecution.execute`                    |
| POST   | `/api/v1/search/query/validate` | `searchExecution.validateQuery`              |
| POST   | `/api/v1/search/suggestions`    | `searchExecution.suggest`                    |
| GET    | `/api/v1/search/capabilities`   | `searchExecutionDiagnostics.getCapabilities` |
| GET    | `/api/v1/search/health`         | `searchExecutionHealth.getHealth`            |
| GET    | `/api/v1/search/readiness`      | `searchExecutionHealth.getReadiness`         |
| GET    | `/api/v1/search/diagnostics`    | `searchExecutionDiagnostics.getDiagnostics`  |
| GET    | `/api/v1/search/statistics`     | `searchExecutionDiagnostics.getStatistics`   |

## Management plane

Under `/api/v1/search/management/...` — providers, configurations, collections, sources, scopes, profiles, capabilities, health, diagnostics, statistics, audit, validation. Prefer list/get; create/update for configurations/collections and provider patch where permission-gated.

## Deliberately omitted

Public index/document HTTP is **not** exposed:

- `/api/v1/search/internal/indexes`
- `/api/v1/search/internal/documents`
- `/api/v1/search/indexes`
- `/api/v1/search/documents`

`searchIndexes` / `searchDocuments` remain gateway-only (ADR-0064).

## Boundaries

- Handlers: `apps/web/lib/api/v1/handlers/search.ts` → `getPlatformServiceGateway()` only
- Schemas: Zod rejects isolation fields, raw Meili filters, semantic/vector, unbounded pages
- Never legacy `gateway.search` / `searchQuery.query`
- Secrets redacted in management responses
