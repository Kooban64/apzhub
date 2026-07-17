# APZOBSERVE-005 — Persistence Review

## Migrations

| Migration | Role |
| --- | --- |
| `0054_apz_platform_observe.sql` | `platform_observe_*` tables |
| `0055_apz_platform_observe_rls.sql` | Row-level security |

## Boundaries

- Repository ports in Core; implementations in observe-persistence  
- Production factory requires `postgresDb` — no silent in-memory  
- Test factory requires explicit `allowInMemoryPersistence: true`  
- Separated from Prometheus/Loki/time-series stores  

## Live PostgreSQL gate

| Evidence | Status |
| --- | --- |
| Schema + RLS SQL present | PASS |
| In-memory tenant isolation tests | PASS |
| Mocked Drizzle / postgres unit tests where present | PASS |
| Live integration against a running PostgreSQL in this CI host | **LIMITED** if unavailable |

**Residual risk:** Deployments must run migrations 0054/0055 and set `APZHUB_OBSERVE_ENABLED=true` with platform PostgreSQL. Does not block metadata-plane classification when production bootstrap forbids memory fallback.
