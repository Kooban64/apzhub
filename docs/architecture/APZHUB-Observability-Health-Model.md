# Observability Health Model

**Milestone:** APZOBSERVE-001

## Status values

`unknown` · `healthy` · `degraded` · `unhealthy` · `maintenance`

## Probe kinds

- **HealthCheck** — general health
- **ReadinessCheck** — `unknown` | `ready` | `not_ready`
- **LivenessCheck** — `unknown` | `alive` | `not_alive`

## Aggregation

`ServiceHealth` combines overall health with readiness and liveness.  
`HealthSummary` stores counts for healthy / degraded / unhealthy within a scope.

## Lifecycle

Fail-closed transitions in `@apzhub/observe-core` (`assertObserveHealthTransition`). Same-status is allowed; unknown transitions throw `ObserveDomainError`.
