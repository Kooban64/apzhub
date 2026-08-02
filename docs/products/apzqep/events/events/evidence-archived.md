# Evidence Archived

| Field            | Value                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Event name       | **Evidence Archived**                                            |
| Event ID         | `qep.evidence.archived`                                          |
| Version          | **1.0.0**                                                        |
| Lifecycle status | **active**                                                       |
| Programme        | APZQEP-120-S07                                                   |
| Producer         | EvidenceLifecyclePlatformService.markArchived / archive commands |
| Known consumers  | S08 workers, S11 search, audit                                   |
| Related ADR      | Platform Event SDK (029); additive evolution only                |
| Related slices   | S07 (define/publish); S08–S13 (consume)                          |

## Purpose

Evidence entered archived lifecycle/status.

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

`events/qep/evidence-archived/event.yaml`
