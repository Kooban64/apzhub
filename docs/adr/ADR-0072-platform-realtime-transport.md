# ADR-0072: Platform Realtime Transport Architecture

## Status

**Accepted** — Programme **Platform-1.3-ADR-0072** (Owner Decision 2026-07-22)  
**Implemented under:** **Platform-1.3-ENG-003** (SSE Phase A — Support)

> **Canonical full ADR:** [docs/architecture/adr/ADR-0072-Platform-Realtime-Transport.md](../architecture/adr/ADR-0072-Platform-Realtime-Transport.md)

## Context

Platform 1.2 delivers Support domain events and webhook fanout via the Platform Event Bus, but product workbenches lack a certified production realtime subscription surface. Support epic **P13-E03** requires realtime inbox/detail updates. ENG-003 is gated on this ADR. ENG-002 (Observe Live Alerts Phase A) is **ACCEPTED**.

## Decision (accepted)

1. Adopt a **platform-owned Realtime Transport Abstraction** (Realtime Subscription Service).
2. Authorize **SSE as the sole Phase A / Platform 1.3 concrete transport**.
3. Path: Client → Gateway → Auth → Authz → Platform Services → Event Bus — never Module → Engine.
4. Mutations remain REST. Bidirectional WebSocket **not** required for approved 1.3 Must epics.
5. Fence ADR-0071 (Notification delivery providers) as a separate concern.
6. Implementation under **Platform-1.3-ENG-003** after this ADR Acceptance.

## Consequences

- Unblocks Support realtime without redesign.
- Prefer SSE on shared host; WS deferred to Owner-gated successor.
- Capacity limits are ENG-003 acceptance criteria.

## Related

- [Full ADR-0072](../architecture/adr/ADR-0072-Platform-Realtime-Transport.md)
- [ADR-0007 Event-Driven Communication](./ADR-0007-event-driven-communication.md)
- [Platform 1.3 EPICS](../strategy/platform-1.3/EPICS.md)
