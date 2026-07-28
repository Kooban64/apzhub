# ADR-0071: Notification Delivery Providers and Routing Architecture

## Status

**Accepted** — Owner Decision Platform-1.3-ENG-004 bootstrap (2026-07-22)  
**Implementation:** **Platform-1.3-ENG-004** — Phase A **IMPLEMENTED / AWAITING OWNER ENGINEERING ACCEPTANCE**

> **Canonical full ADR:** [docs/architecture/adr/ADR-0071-Notification-Delivery-Providers-and-Routing.md](../architecture/adr/ADR-0071-Notification-Delivery-Providers-and-Routing.md)  
> **Owner acceptance:** [OWNER-ACCEPTANCE-ADR-0071](../architecture/adr/OWNER-ACCEPTANCE-ADR-0071.md)  
> **Engineering pack:** [platform-1.3-eng-004](../engineering/platform-1.3-eng-004/README.md)

## Context

APZNOTIFY owns Notification metadata and the additive delivery plane. Platform 1.3 epic **P13-E04** delivers Phase A via **ENG-004**. Email SoR, Realtime Transport (ADR-0072), and Workflow Execute remain separate fences.

## Decision (accepted)

1. **Hybrid Option D**: Central Notification Delivery Service + event-driven intake + command intake.
2. Notification Platform Services own Intent, routing, delivery state, retries, provider abstraction.
3. Products never call providers; Observe/Support integrate via events/hooks only.
4. Explicit fence vs Email SoR · Realtime SSE subscription · Workflow Execute · FIN-001.
5. Integration SDK **1.0.0** remains frozen.
6. Phase A certified path: **in-app**; SMTP deferred without approved outbound path.

## Consequences

- P13-E04 Phase A implemented under ENG-004.
- SMTP / SMS / push remain deferred or unauthorised.
- CERT-001 and ENG-005 remain STOP until Owner Engineering Acceptance + new approval.
