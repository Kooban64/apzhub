# Observability Typed Client Guide

**Milestone:** APZOBSERVE-003  
**Package path:** `apps/web/lib/observe`

## Purpose

Production typed client for the Observability HTTP API. Consumes **only** `/api/v1/observe/*`.

## API surface

| Export                                                         | Role                                                |
| -------------------------------------------------------------- | --------------------------------------------------- |
| `createHttpObserveClient()`                                    | Fetch-based client                                  |
| `createMockObserveClient()`                                    | In-memory test client                               |
| `getObserveClient` / `setObserveClient` / `resetObserveClient` | Runtime accessor                                    |
| `observeQueryKeys`                                             | TanStack Query keys for all 19 facets + diagnostics |
| `assertObserveApiPath`                                         | Path guard + forbidden segment enforcement          |

## Facet methods

Each CRUD facet exposes `list`, `get`, `create`, `update`.

Diagnostics additionally expose `health`, `readiness`, `capabilities`, `management`.

Top-level helpers: `getHealth`, `getReadiness`, `getCapabilities`.

## Boundaries

**Must not import:** `@apzhub/platform-services`, `@apzhub/observe-core`, `@apzhub/observe-persistence`, `getPlatformServiceGateway`.

**Must not call:** provider scrape/ingest/execute methods or any path outside `/api/v1/observe`.

## Query keys

Root: `["observe"]`. Example: `observeQueryKeys.healthChecks.list()`, `observeQueryKeys.diagnostics.health()`.

## See also

- [Observability HTTP API](../architecture/APZHUB-Observability-HTTP-API.md)
- [Consumer Guide](./APZHUB-Observability-HTTP-Consumer-Guide.md)
