# Platform 1.4 Infrastructure and Portability

## Retain

PostgreSQL · Redis · Event Bus · Outbox · Caddy/Nginx edge · shared-host coexistence · worker processes · health/readiness · config/secrets · monitoring/logging/metrics · backup/recovery patterns.

## Platform 1.4 needs

| Need                                   | Approach                     |
| -------------------------------------- | ---------------------------- |
| Worker deployment for durable delivery | Document topology; additive  |
| Capacity measurement on shared-host    | E02 evidence                 |
| Graceful shutdown / drain              | Ops + ENG expectations       |
| Portability                            | Avoid cloud-specific lock-in |

## Explicit

No new cloud-specific dependency without future accepted ADR. No topology redesign under ARCH-001.
