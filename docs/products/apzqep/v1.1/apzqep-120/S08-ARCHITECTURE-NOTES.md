# APZQEP-120-S08 — Architecture Notes

## Decision

Extend `@apzhub/platform-outbox` as the enterprise Reliable Delivery Platform, then wire Evidence Application Services through an outbox-backed publisher. Domain event semantics stay in S07; infrastructure only persists and delivers.

## Why not Evidence-only outbox

Owner refinement: treat Outbox as an enterprise capability. Proving the engine in APZQEP while keeping it product-agnostic preserves a clean path to portfolio reuse without redesign later.

## Boundaries

```text
Presentation / Modules  →  Application Services  →  Platform Outbox  →  DeliveryPort  →  Engine/bus (future)
                                   ↑
                         Domain events (S07 catalogue)
```

Repositories, storage providers, and connectors do not publish business events.

## Transport neutrality

S08 ships `DeliveryPort` + Null adapter only. Future Kafka/NATS/etc. require adapter implementation alone.
