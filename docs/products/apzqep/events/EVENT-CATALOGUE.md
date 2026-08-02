# APZQEP Evidence Domain Event Catalogue

| Field             | Value                                 |
| ----------------- | ------------------------------------- |
| Document          | EVENT-CATALOGUE                       |
| Product           | APZQEP                                |
| Domain            | Evidence                              |
| Programme         | APZQEP-120-S07                        |
| Catalogue version | **1.0.0**                             |
| Status            | **ACTIVE**                            |
| Publisher         | `qep-evidence` (Application Services) |
| Timestamp (UTC)   | 20260802T123953Z                      |

This catalogue is a **first-class product asset**. Event semantics are owned by the Evidence domain. Infrastructure transports events; it does not define them.

Conforms to: APZQEP Engineering Framework v1.0 · Governance 1.0 STABLE · Enterprise Baseline 1.2 · Platform Event SDK (029).

---

## Compatibility rules

1. Event schema versioning is mandatory (`eventVersion` on every envelope).
2. Changes SHALL be additive where possible.
3. Breaking changes REQUIRE an ADR and Product Board approval.
4. Repositories, storage providers, and infrastructure MUST NOT publish business events.
5. Application Services are the sole publishers for Evidence domain events.

---

## Registered events (v1.0.0)

| Event ID                             | Name                           | Version | Status | Doc                                                                                    |
| ------------------------------------ | ------------------------------ | ------- | ------ | -------------------------------------------------------------------------------------- |
| `qep.evidence.created`               | Evidence Created               | 1.0.0   | active | [events/evidence-created.md](./events/evidence-created.md)                             |
| `qep.evidence.updated`               | Evidence Updated               | 1.0.0   | active | [events/evidence-updated.md](./events/evidence-updated.md)                             |
| `qep.evidence.lifecycle_changed`     | Evidence Lifecycle Changed     | 1.0.0   | active | [events/evidence-lifecycle-changed.md](./events/evidence-lifecycle-changed.md)         |
| `qep.evidence.integrity_established` | Evidence Integrity Established | 1.0.0   | active | [events/evidence-integrity-established.md](./events/evidence-integrity-established.md) |
| `qep.evidence.integrity_verified`    | Evidence Integrity Verified    | 1.0.0   | active | [events/evidence-integrity-verified.md](./events/evidence-integrity-verified.md)       |
| `qep.evidence.archived`              | Evidence Archived              | 1.0.0   | active | [events/evidence-archived.md](./events/evidence-archived.md)                           |
| `qep.evidence.superseded`            | Evidence Superseded            | 1.0.0   | active | [events/evidence-superseded.md](./events/evidence-superseded.md)                       |
| `qep.evidence.deleted`               | Evidence Deleted               | 1.0.0   | active | [events/evidence-deleted.md](./events/evidence-deleted.md)                             |

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
- Slice notes: `docs/products/apzqep/v1.1/apzqep-120/S07-ENGINEERING-NOTES.md`
