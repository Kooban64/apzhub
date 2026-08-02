# APZQEP-120-S07 — Engineering Notes

| Field          | Value                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Slice          | APZQEP-120-S07 QEP Domain Event Catalogue & Publish                                                 |
| Classification | Product Engineering · CRITICAL PATH                                                                 |
| Conforms to    | APZQEP Engineering Framework v1.0 · ES-001 · ES-002 · ES-003 · Governance 1.0 STABLE · Baseline 1.2 |
| Date (UTC)     | 20260802T123953Z                                                                                    |
| Depends on     | S01–S06 (certified)                                                                                 |
| Engineering    | COMPLETE                                                                                            |

---

## Capability statement

S07 delivers the **Evidence Domain Event Platform**:

- versioned product Event Catalogue
- registered platform event IDs
- envelope + validation + idempotency keys
- Application Service publisher (fail-soft)
- mapping from in-process domain events → catalogue events
- lifecycle / integrity publish paths

It does **not** deliver workers, search, notifications, UCP, AI, or a new external bus.

## Architecture

```text
Application Service (commands / integrity / lifecycle)
  → Domain mutation (event semantics)
  → persist / transition
  → DomainEventCollector (in-proc)
  → QepEvidenceEventPublisher.publish(envelope)   ← S07
       (in-memory | future platform-event-bus adapter — S08+)

Repositories / Storage / Infrastructure
  → MUST NOT publish business events
```

## Modules

| Component                    | Path                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| Catalogue keys / descriptors | `packages/qep-evidence/src/application/events/catalogue.ts` |
| Envelope + validation        | `.../envelope.ts`                                           |
| Publisher port + in-memory   | `.../publisher.ts`                                          |
| Domain → platform map        | `.../map-domain-events.ts`                                  |
| Lifecycle publish            | `.../publish-lifecycle.ts`                                  |
| Product catalogue            | `docs/products/apzqep/events/EVENT-CATALOGUE.md`            |
| Manifests                    | `events/qep/evidence-*/event.yaml`                          |

## Registered events (v1.0.0)

`qep.evidence.created` · `updated` · `lifecycle_changed` · `integrity_established` · `integrity_verified` · `archived` · `superseded` · `deleted`

## Compatibility

- Schema versioning mandatory (`eventVersion`)
- Additive evolution preferred
- Breaking changes → ADR + Product Board

## Deferred

- S08 outbox drain / bus transport adapter
- S09 retries/DLQ
- S10 failure evidence
- S11–S13 consumers
- TE EvidenceAccessPort
- Non-Evidence QEP event families (execution, etc.)

## Status markers

- `QEP_EVIDENCE_APPLICATION_STATUS = event-platform-s07`
