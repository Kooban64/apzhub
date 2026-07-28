# SSE Architecture — Platform-1.3-ENG-003

## Decision binding

ADR-0072 **ACCEPTED**: Transport Abstraction + **SSE only** for Platform 1.3.

## Runtime binding

Uses the **existing Platform Runtime**:

- Request Pipeline session entry (`withPlatformApiAuth`)
- platform-authorization permission resolution (aligned with ProductionAuthorizationProvider grants)
- Platform Event Bus fan-in
- Platform Service Gateway remains the mutation path (REST)
- Workbench boundaries preserved
- Integration SDK **1.0.0** untouched

**No parallel realtime framework** is introduced.

## Path

```
Support Workbench (EventSource)
  → API Gateway SSE route
  → Session authentication + validation
  → Permission resolution (platform-authorization)
  → RealtimeSubscriptionService (sole outbound abstraction)
  → Event Bus fan-in (support.*) → mapped wire events only
```

Raw / engine events are never exposed to clients.

## Controls (engineering requirements)

| Control                   | Behaviour                                                                |
| ------------------------- | ------------------------------------------------------------------------ |
| Connection authentication | Session required via Request Pipeline                                    |
| Session validation        | Session id tracked; heartbeat revalidation hook                          |
| Tenant isolation          | Drop cross-tenant fan-out                                                |
| Organisation isolation    | When connection is org-scoped, drop org mismatches                       |
| Permission filtering      | `support.requests.read                                                   | list | get`or`support.*` |
| Automatic reconnect       | Client exponential backoff                                               |
| Last-Event-ID             | Server ring buffer replay after cursor                                   |
| Heartbeat events          | `realtime.heartbeat`                                                     |
| Idle timeout              | No business wire events for `IDLE_TIMEOUT_MS` → disconnect               |
| Graceful disconnect       | `realtime.disconnect` / stream cancel                                    |
| Server shutdown           | `shutdown()` → `realtime.shutdown` + SIGTERM/SIGINT hook                 |
| Back-pressure             | Bounded per-connection queue; drop oldest                                |
| Event coalescing          | Coalesce queued `updated` / `status_changed` per ticket                  |
| Replay prevention         | Cursor exclusive; delivered-id set per connection                        |
| Duplicate suppression     | Ingest + per-connection id windows                                       |
| Structured logging        | JSON scope `realtime-subscription`                                       |
| Diagnostics / metrics     | `/realtime/diagnostics` counters                                         |
| Health classification     | disabled / degraded / healthy / unhealthy                                |
| Audit events              | `realtime.connection.*` / `realtime.shutdown` via Domain Event Publisher |

## Non-goals confirmed

No WebSocket server · No Notification Delivery · No Observe realtime product stream · No Integration SDK changes.
