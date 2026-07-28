# Durable Runtime Architecture (Selected)

## Decision summary

**Authoritative System of Record:** Platform PostgreSQL notification delivery plane (extend migration **0065** entities).

**Workers:** Notification Delivery workers (Platform Services / dedicated worker process identity) claim eligible delivery rows using transaction-safe leasing.

**Events:** Domain/ops events published **after** durable state transitions (fail-soft), via existing publisher/Event Bus — events are not the SoR.

**Providers:** Unchanged abstraction; dispatch occurs only after claim; provider refs stored on attempt records.

**Realtime:** Optional additive SSE attention signals remain presentation; not part of claim transaction (ADR-0072).

## Ownership

| Concern                                    | Owner                                                   |
| ------------------------------------------ | ------------------------------------------------------- |
| Intent / delivery / attempt / DLQ / leases | Notification Delivery Platform Service                  |
| Metadata templates/prefs catalogue         | APZNOTIFY metadata SoR (unchanged)                      |
| In-app Attention item identity             | Delivery plane + existing notification metadata linkage |
| Observe/Support business entities          | Product owners (unchanged)                              |

## Topology (minimum)

1. API/Gateway process — command/event intake writes Postgres.
2. Worker process(es) — claim + dispatch + retry/DLQ updates.
3. PostgreSQL — SoR.
4. Optional: same host multi-worker with lease fencing.

No Redis required for correctness. No external broker.
