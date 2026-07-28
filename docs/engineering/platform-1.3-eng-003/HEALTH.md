# Health — Platform-1.3-ENG-003

## Endpoint

`GET /api/v1/realtime/health`

## Status model

| Status                  | Meaning                            |
| ----------------------- | ---------------------------------- |
| `disabled`              | Feature flag off                   |
| `degraded`              | Enabled but Event Bus not attached |
| `healthy`               | Enabled + bus attached             |
| `unhealthy` / `unknown` | Reserved                           |

## Administration

Health and diagnostics are the Platform 1.3 administration surfaces for realtime transport (no separate Admin Workbench module in this programme).
