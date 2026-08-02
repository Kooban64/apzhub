# APZQEP Evidence Domain Event Catalogue

| Field             | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| Document          | EVENT-CATALOGUE                                                |
| Product           | APZQEP                                                         |
| Domain            | Evidence                                                       |
| Programme         | APZQEP-120-S07                                                 |
| Catalogue version | **1.0.5**                                                      |
| Status            | **ACTIVE** · S07–S11 Board **CERTIFIED** · S12 Notify **PASS** |
| Publisher         | `qep-evidence` (Application Services)                          |
| Delivery          | `@apzhub/platform-outbox` (S08 Board **CERTIFIED**)            |
| Processing        | `@apzhub/platform-processing` + Evidence processors (S10)      |
| Projection        | `@apzhub/qep-knowledge-index` Quality Knowledge Index (S11)    |
| Notification      | `@apzhub/qep-notification` Subscription Platform (S12)         |
| Timestamp (UTC)   | 20260802T161211Z                                               |

This catalogue is a **first-class product asset**. Event semantics are owned by the Evidence domain. Infrastructure transports events; it does not define them.

Conforms to: APZQEP Engineering Framework v1.0 · Governance 1.0 STABLE · Enterprise Baseline 1.2 · Platform Event SDK (029).

---

## Maturity fields (mandatory on every event)

| Field             | Values                             | Purpose                                |
| ----------------- | ---------------------------------- | -------------------------------------- |
| **Stability**     | Experimental / Stable / Deprecated | Consumer risk and evolution discipline |
| **Introduced In** | Slice or baseline id               | Provenance of first appearance         |

---

## Compatibility rules

1. Event schema versioning is mandatory (`eventVersion` on every envelope).
2. Changes SHALL be additive where possible.
3. Breaking changes REQUIRE an ADR and Product Board approval.
4. Repositories, storage providers, and infrastructure MUST NOT publish business events.
5. Application Services are the sole publishers for Evidence domain events.
6. Stability may move Experimental → Stable; Stable → Deprecated requires Product Board notice.

---

## Delivery consumer metadata (S08)

| Field                    | Value                                                               |
| ------------------------ | ------------------------------------------------------------------- |
| Delivery mechanism       | `@apzhub/platform-outbox` Reliable Delivery Platform                |
| Enqueue path             | Application `createOutboxQepEvidenceEventPublisher` → `OutboxStore` |
| Default transport        | Null `DeliveryPort` (no external bus)                               |
| Idempotency              | Catalogue `idempotencyKey` → outbox `deliveryIdempotencyKey`        |
| Event / payload / schema | **Unchanged** from S07 (no redesign)                                |

---

## Processor ownership (S10)

| Event ID                             | Owning processor                      |
| ------------------------------------ | ------------------------------------- |
| `qep.evidence.created`               | `qep.evidence.processor.created`      |
| `qep.evidence.updated`               | `qep.evidence.processor.updated`      |
| `qep.evidence.lifecycle_changed`     | `qep.evidence.processor.lifecycle`    |
| `qep.evidence.integrity_established` | `qep.evidence.processor.integrity`    |
| `qep.evidence.integrity_verified`    | `qep.evidence.processor.integrity`    |
| `qep.evidence.archived`              | `qep.evidence.processor.archive`      |
| `qep.evidence.superseded`            | `qep.evidence.processor.supersession` |
| `qep.evidence.deleted`               | `qep.evidence.processor.delete`       |

See [BUSINESS-PROCESSORS.md](../v1.1/apzqep-120/BUSINESS-PROCESSORS.md). Event semantics unchanged.

---

## Search / projection consumer metadata (S11)

| Field             | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| Consumer          | Quality Knowledge Index (`@apzhub/qep-knowledge-index`) |
| Projection        | `qep.knowledge.evidence.v1`                             |
| Indexing path     | Event Platform only — never queries Evidence SoR        |
| Consistency       | Eventually consistent                                   |
| Rebuild           | Replay via `rebuildFromEvents`                          |
| First UI consumer | Search Query Service (projection-only)                  |
| Future consumers  | Command Palette, QI, AI, Executive Dashboards           |

See [QUALITY-KNOWLEDGE-INDEX.md](../v1.1/apzqep-120/QUALITY-KNOWLEDGE-INDEX.md).

---

## Notification / subscription consumer metadata (S12)

| Field            | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Consumer         | Notification & Subscription Platform (`@apzhub/qep-notification`)  |
| Pattern          | **Subscriber** — never invokes business services                   |
| Sources          | Domain Events (Evidence today); QKI projections ready              |
| Delivery channel | Internal only (S12); other channels via adapters later             |
| Reliability      | S09 retry/DLQ + optional S08 delivery intents                      |
| Classification   | severity · priority · category · audience · expiry · correlationId |

### Notification processor ownership

| Event ID                             | Notification processor                             |
| ------------------------------------ | -------------------------------------------------- |
| `qep.evidence.created`               | `qep.notification.processor.evidence.created`      |
| `qep.evidence.updated`               | `qep.notification.processor.evidence.updated`      |
| `qep.evidence.lifecycle_changed`     | `qep.notification.processor.evidence.lifecycle`    |
| `qep.evidence.integrity_established` | `qep.notification.processor.evidence.integrity`    |
| `qep.evidence.integrity_verified`    | `qep.notification.processor.evidence.integrity`    |
| `qep.evidence.archived`              | `qep.notification.processor.evidence.archive`      |
| `qep.evidence.superseded`            | `qep.notification.processor.evidence.supersession` |
| `qep.evidence.deleted`               | `qep.notification.processor.evidence.delete`       |

See [NOTIFICATION-PLATFORM.md](../v1.1/apzqep-120/NOTIFICATION-PLATFORM.md). Event semantics unchanged.

---

## Registered events (v1.0.5 — semantics unchanged from v1.0.1)

| Event ID                             | Name                           | Version | Stability | Introduced In  | Status | Processor                 | Doc                                                                                    |
| ------------------------------------ | ------------------------------ | ------- | --------- | -------------- | ------ | ------------------------- | -------------------------------------------------------------------------------------- |
| `qep.evidence.created`               | Evidence Created               | 1.0.0   | Stable    | APZQEP-120-S07 | active | `…processor.created`      | [events/evidence-created.md](./events/evidence-created.md)                             |
| `qep.evidence.updated`               | Evidence Updated               | 1.0.0   | Stable    | APZQEP-120-S07 | active | `…processor.updated`      | [events/evidence-updated.md](./events/evidence-updated.md)                             |
| `qep.evidence.lifecycle_changed`     | Evidence Lifecycle Changed     | 1.0.0   | Stable    | APZQEP-120-S07 | active | `…processor.lifecycle`    | [events/evidence-lifecycle-changed.md](./events/evidence-lifecycle-changed.md)         |
| `qep.evidence.integrity_established` | Evidence Integrity Established | 1.0.0   | Stable    | APZQEP-120-S07 | active | `…processor.integrity`    | [events/evidence-integrity-established.md](./events/evidence-integrity-established.md) |
| `qep.evidence.integrity_verified`    | Evidence Integrity Verified    | 1.0.0   | Stable    | APZQEP-120-S07 | active | `…processor.integrity`    | [events/evidence-integrity-verified.md](./events/evidence-integrity-verified.md)       |
| `qep.evidence.archived`              | Evidence Archived              | 1.0.0   | Stable    | APZQEP-120-S07 | active | `…processor.archive`      | [events/evidence-archived.md](./events/evidence-archived.md)                           |
| `qep.evidence.superseded`            | Evidence Superseded            | 1.0.0   | Stable    | APZQEP-120-S07 | active | `…processor.supersession` | [events/evidence-superseded.md](./events/evidence-superseded.md)                       |
| `qep.evidence.deleted`               | Evidence Deleted               | 1.0.0   | Stable    | APZQEP-120-S07 | active | `…processor.delete`       | [events/evidence-deleted.md](./events/evidence-deleted.md)                             |

---

## Envelope (mandatory fields)

| Field              | Required             |
| ------------------ | -------------------- |
| envelopeId         | YES                  |
| eventId            | YES (catalogue key)  |
| eventVersion       | YES                  |
| category           | YES (`business`)     |
| correlationId      | YES                  |
| causationId        | OPTIONAL             |
| timestamp          | YES (ISO-8601)       |
| publisher          | YES (`qep-evidence`) |
| actorId            | OPTIONAL             |
| sourceService      | YES (`qep-evidence`) |
| tenantId           | YES                  |
| idempotencyKey     | YES                  |
| payload.evidenceId | YES                  |
| payload.tenantId   | YES                  |

---

## Manifests

Machine-readable manifests: `events/qep/<slug>/event.yaml` at repository root.

---

## Related

- Implementation: `packages/qep-evidence/src/application/events/`
- Processors: `packages/qep-evidence/src/application/processors/`
- Outbox: `packages/platform-outbox` · Processing: `packages/platform-processing`
- [BUSINESS-PROCESSORS.md](../v1.1/apzqep-120/BUSINESS-PROCESSORS.md) · [S10-ENGINEERING-NOTES.md](../v1.1/apzqep-120/S10-ENGINEERING-NOTES.md)
