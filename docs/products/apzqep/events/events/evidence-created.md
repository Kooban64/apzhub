# Evidence Created

| Field            | Value                                             |
| ---------------- | ------------------------------------------------- |
| Event name       | **Evidence Created**                              |
| Event ID         | `qep.evidence.created`                            |
| Version          | **1.0.0**                                         |
| Lifecycle status | **active**                                        |
| Programme        | APZQEP-120-S07                                    |
| Producer         | EvidenceCommandService.captureEvidence            |
| Known consumers  | S08 workers, S11 search, S13 notifications, audit |
| Related ADR      | Platform Event SDK (029); additive evolution only |
| Related slices   | S07 (define/publish); S08–S13 (consume)           |

## Purpose

Evidence record was captured / created.

## Payload schema (v1.0.0)

| Field                              | Type   | Required | Notes                                  |
| ---------------------------------- | ------ | -------- | -------------------------------------- |
| evidenceId                         | string | YES      | Aggregate id                           |
| tenantId                           | string | YES      | Tenant scope                           |
| revision                           | number | OPTIONAL | Evidence revision at publish           |
| domainEventType                    | string | OPTIONAL | Internal domain event type when mapped |
| domainEventId                      | string | OPTIONAL | Internal domain event id               |
| sourceState / targetState / action | string | OPTIONAL | Lifecycle events                       |
| reason                             | string | OPTIONAL | Human/system reason                    |
| successorEvidenceId                | string | OPTIONAL | Supersession                           |

## Compatibility notes

Additive fields MAY be introduced in a minor version bump. Removing or renaming fields is a breaking change and requires ADR + Product Board approval.

## Manifest

`events/qep/evidence-created/event.yaml`
