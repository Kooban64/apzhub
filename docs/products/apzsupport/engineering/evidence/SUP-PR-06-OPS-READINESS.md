# SUP-PR-06 — Ops readiness pack

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-PR-06**    |
| Slice  | **APZSUP-206**   |
| Status | **Closed**       |
| Date   | 20260808T174000Z |

## Flags

| Flag                                        | Default                     | Meaning                                 |
| ------------------------------------------- | --------------------------- | --------------------------------------- |
| `ZAMMAD_INTEGRATION_ENABLED`                | off unless set              | Registers Support adapter               |
| `ENTITY_MAPPING_STORE_MODE`                 | prod→postgres / else memory | Mapping durability                      |
| `ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION` | unset                       | Escape hatch only                       |
| `APZHUB_REALTIME_SSE_ENABLED`               | deny-by-default             | Platform SSE                            |
| `NEXT_PUBLIC_APZHUB_REALTIME_SSE_ENABLED`   | unset                       | Support UI realtime (v1.0: leave unset) |

## Health / readiness

- `GET /api/v1/health` — gateway, mapping, providers, `zammadEnabled`
- Readiness fails closed when production Zammad enabled but providers unregistered (SUP-PR-01)

## Runbooks

- [support-adapter-unhealthy.md](../../../../operations/runbooks/support-adapter-unhealthy.md)

## Backup

Platform Postgres includes `platform_entity_mapping` (Support ID bindings). Ticket business data remains in the Support engine (011).

## Honest PRWL

No Support-native Workbench health UI in v1.0. Realtime not product-enabled (SUP-PR-03).
