# ADR-0070: Observe Live Alert Evaluation & Delivery Plane

## Status

**Accepted** — Owner Decision Platform-1.3-ENG-002 (2026-07-22)  
**Implemented (Phase A):** Platform-1.3-ENG-002 — [engineering pack](../engineering/platform-1.3-eng-002/README.md)

> **Canonical full ADR:** [docs/architecture/adr/ADR-0070-Observe-Live-Alert-Evaluation-and-Delivery.md](../architecture/adr/ADR-0070-Observe-Live-Alert-Evaluation-and-Delivery.md)

## Context

APZOBSERVE-006 froze Platform Observability as a **metadata governance SoR**. The freeze lists **alert evaluation and notification delivery** as an intentional absence requiring ADR + owner approval + new milestone.

Platform 1.3 epic **P13-E02** (ENG-002) requires automated alert evaluation/delivery beyond catalogue + manual triage, without redesigning Observe into Grafana/Prometheus productisation and without claiming Email SoR.

Platform-1.3-ENG-001 is **ACCEPTED**. This ADR is the mandatory gate before ENG-002.

## Decision (proposed)

1. Authorize an additive **Observe Alert Evaluation & Delivery plane** under Observability Platform Services.
2. Preserve frozen Observe metadata SoR (definitions, states, admin workbench, HTTP `/api/v1/observe/*`).
3. Evaluation runs **async** (jobs/workers per 012) — Phase A: Observe metadata signals only; no PromQL/LogQL; no live telemetry provider integrations.
4. Delivery hooks call Platform Notification delivery (ADR-0071) or documented interim channels — Observe does **not** become a second notification identity SoR or Email SoR.
5. Change control: ADR Acceptance + **Platform-1.3-ENG-002** Owner Approval required before implementation; freeze notice updated after ENG-002.

## Consequences

- Unblocks P13-E02 without structural redesign.
- Keeps Observability ≠ Analytics ≠ Metrics ≠ Notifications SoR boundaries (ADR-0066).
- Requires honesty docs on which delivery channels are live until ADR-0071.

## Related

- [Full ADR-0070](../architecture/adr/ADR-0070-Observe-Live-Alert-Evaluation-and-Delivery.md)
- [Observability Architecture Freeze Notice](../architecture/APZHUB-Observability-Architecture-Freeze-Notice.md)
- [Platform 1.3 EPICS](../strategy/platform-1.3/EPICS.md)
