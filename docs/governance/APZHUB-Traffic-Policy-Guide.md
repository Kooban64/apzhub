# APZHUB Traffic Policy Guide (PRH-005)

## Canonical policies

| Policy ID | Service | Pattern | Limit (prod) | Dimensions |
|-----------|---------|---------|--------------|--------------|
| `auth-sensitive` | auth | `/api/auth/sign-in`, `sign-up`, password reset | 30/min | ip, endpoint |
| `auth-general` | auth | `/api/auth/*` | 60/min | ip, service |
| `platform-privileged` | platform | `/api/platform/v1/*` | 120/min | ip, user, tenant, endpoint, service |
| `law-api` | law | `/api/law/v1/*` | 120/min | ip, user, tenant, endpoint, service |
| `public-health` | public | health/liveness/readiness probes | 300/min | ip, endpoint |
| `csp-report` | public | CSP violation reporting | 60/min | ip, endpoint |
| `law-openapi` | public | Law OpenAPI specs | 120/min | ip, endpoint |

## Burst handling

Each policy supports burst windows (default 10 seconds) with a burst multiplier (default 1.5–2x). Sustained limits use per-minute windows.

## Environment profiles

| Profile | Multiplier |
|---------|------------|
| development | 10x |
| test | 100x |
| production | 1x |

## Response contract

Throttled requests return **429** with:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `X-Traffic-Policy`
- `X-Traffic-Service`
- `Retry-After`

## Change control

New API surfaces must map to an existing policy or add a registry entry in `CANONICAL_TRAFFIC_POLICIES`. Products must not define parallel limiters.

## References

- [Traffic Governance Architecture](../architecture/APZHUB-Traffic-Governance-Architecture.md)
