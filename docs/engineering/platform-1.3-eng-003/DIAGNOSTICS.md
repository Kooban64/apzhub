# Diagnostics — Platform-1.3-ENG-003

## Endpoint

`GET /api/v1/realtime/diagnostics`

## Fields

- `enabled`, `transport` (`sse` only), `shuttingDown`
- `activeConnections`, `connectionsByTenant`
- `eventsDelivered`, `eventsDroppedBackpressure`, `eventsCoalesced`
- `duplicatesSuppressed`, `replayedEvents`, `heartbeatsSent`
- `authzDenials`, `tenantMismatches`, `organisationMismatches`
- `idleTimeouts`, `gracefulDisconnects`
- `lastEventAt`, `busAttached`
- Capacity / lifecycle (`maxConnections*`, `maxQueuePerConnection`, `replayBufferSize`, `idleTimeoutMs`)

Use for ops triage and shared-host capacity planning.
