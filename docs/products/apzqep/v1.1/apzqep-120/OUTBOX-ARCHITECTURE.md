# Outbox Architecture — APZQEP-120-S08

| Field     | Value                                          |
| --------- | ---------------------------------------------- |
| Programme | APZQEP-120                                     |
| Slice     | S08 — Reliable Event Delivery (Outbox Drain)   |
| Package   | `@apzhub/platform-outbox` **0.2.0**            |
| Status    | **ACTIVE** · Product Board **CERTIFIED** (S08) |
| Rule      | Platform Outbox ownership (below)              |

## Purpose

Guarantee durable persistence and reliable delivery of domain events published by Application Services (S07 catalogue). Transport-neutral. Not a messaging product.

## Enterprise capability

The delivery engine lives in `@apzhub/platform-outbox` so it can later be consumed by other products without Evidence-specific coupling. Domain event semantics remain in APZQEP; the outbox engine is product-agnostic (“prove in product, then abstract”). At S08 Board CERTIFIED, the abstraction is **justified**.

## Platform Rule

```text
Platform Rule

No APZHUB product may implement its own Outbox engine.

Products SHALL consume
@apzhub/platform-outbox.

Product-specific behaviour SHALL be implemented only through:

• Event Publishers

• DeliveryPort implementations

• Event Consumers

The Outbox lifecycle is owned exclusively by the Platform.
```

This is a **platform architecture rule** (not an Enterprise Standard). It may later be promoted via the same abstraction-based governance process if portfolio reuse warrants it. Governance artefacts and ES-001…ES-003 remain unchanged.

## Layers

```text
Application Service
  → Domain Events
    → Platform Outbox
      → DeliveryPort
        → Future Transport
```

Composition detail:

```text
Application Service
  → QepEvidenceEventPublisher (outbox-backed)
    → OutboxStore.enqueue (Pending)
      → ReliableDeliveryPlatform.processBatch
        → DeliveryPort / TransportAdapter
          → Null transport (S08) | future adapters
```

## Layer publish / deliver rules

| Layer             | May publish / deliver?            |
| ----------------- | --------------------------------- |
| Application       | YES — enqueue catalogue envelopes |
| Domain            | NO — semantics only               |
| Repositories      | NO                                |
| Storage providers | NO                                |
| Infrastructure    | YES — drain / transport only      |

## Persistence

| Store                               | Table / backend         | Role                                            |
| ----------------------------------- | ----------------------- | ----------------------------------------------- |
| `createInMemoryOutboxStore`         | process memory          | Tests + local composition                       |
| `createPostgresPlatformOutboxStore` | `platform_outbox_event` | Enterprise durable store (migrations 0093–0094) |
| `createPostgresLawOutboxStore`      | `law_outbox_event`      | Existing LAW consumer (unchanged)               |

## Related

- [DELIVERY-LIFECYCLE.md](./DELIVERY-LIFECYCLE.md)
- [TRANSPORT-ABSTRACTION.md](./TRANSPORT-ABSTRACTION.md)
- [RETRY-POLICY.md](./RETRY-POLICY.md)
- [S08-ENGINEERING-NOTES.md](./S08-ENGINEERING-NOTES.md)
- [S08-PRODUCT-BOARD-CERTIFICATION.md](./S08-PRODUCT-BOARD-CERTIFICATION.md)
- [PLATFORM-CATALOGUE.md](../../../../architecture/PLATFORM-CATALOGUE.md)
