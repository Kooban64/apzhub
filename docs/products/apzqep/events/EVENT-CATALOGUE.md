# APZQEP Evidence Domain Event Catalogue

| Field             | Value                                                             |
| ----------------- | ----------------------------------------------------------------- |
| Document          | EVENT-CATALOGUE                                                   |
| Product           | APZQEP                                                            |
| Domain            | Evidence                                                          |
| Programme         | APZQEP-120-S07                                                    |
| Catalogue version | **1.0.2**                                                         |
| Status            | **ACTIVE** · S07 Board **CERTIFIED** · S08 delivery **CERTIFIED** |
| Publisher         | `qep-evidence` (Application Services)                             |
| Delivery          | `@apzhub/platform-outbox` (S08 Board **CERTIFIED**)               |
| Timestamp (UTC)   | 20260802T141518Z                                                  |

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

## Registered events (v1.0.2 — semantics unchanged from v1.0.1)

| Event ID                             | Name                           | Version | Stability | Introduced In  | Status | Doc                                                                                    |
| ------------------------------------ | ------------------------------ | ------- | --------- | -------------- | ------ | -------------------------------------------------------------------------------------- |
| `qep.evidence.created`               | Evidence Created               | 1.0.0   | Stable    | APZQEP-120-S07 | active | [events/evidence-created.md](./events/evidence-created.md)                             |
| `qep.evidence.updated`               | Evidence Updated               | 1.0.0   | Stable    | APZQEP-120-S07 | active | [events/evidence-updated.md](./events/evidence-updated.md)                             |
| `qep.evidence.lifecycle_changed`     | Evidence Lifecycle Changed     | 1.0.0   | Stable    | APZQEP-120-S07 | active | [events/evidence-lifecycle-changed.md](./events/evidence-lifecycle-changed.md)         |
| `qep.evidence.integrity_established` | Evidence Integrity Established | 1.0.0   | Stable    | APZQEP-120-S07 | active | [events/evidence-integrity-established.md](./events/evidence-integrity-established.md) |
| `qep.evidence.integrity_verified`    | Evidence Integrity Verified    | 1.0.0   | Stable    | APZQEP-120-S07 | active | [events/evidence-integrity-verified.md](./events/evidence-integrity-verified.md)       |
| `qep.evidence.archived`              | Evidence Archived              | 1.0.0   | Stable    | APZQEP-120-S07 | active | [events/evidence-archived.md](./events/evidence-archived.md)                           |
| `qep.evidence.superseded`            | Evidence Superseded            | 1.0.0   | Stable    | APZQEP-120-S07 | active | [events/evidence-superseded.md](./events/evidence-superseded.md)                       |
| `qep.evidence.deleted`               | Evidence Deleted               | 1.0.0   | Stable    | APZQEP-120-S07 | active | [events/evidence-deleted.md](./events/evidence-deleted.md)                             |

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
- Outbox: `packages/platform-outbox` · [OUTBOX-ARCHITECTURE.md](../v1.1/apzqep-120/OUTBOX-ARCHITECTURE.md)
- Product Board: `docs/products/apzqep/v1.1/apzqep-120/S07-PRODUCT-BOARD-CERTIFICATION.md`
- Slice notes: S07 · [S08-ENGINEERING-NOTES.md](../v1.1/apzqep-120/S08-ENGINEERING-NOTES.md)
