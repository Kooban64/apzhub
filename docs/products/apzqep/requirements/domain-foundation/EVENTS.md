# Domain Events — Requirements

> **Programme:** APZQEP-ENG-020A  
> **Status:** Type definitions only — **no event bus implementation**

| Event type                         | TypeScript alias             |
| ---------------------------------- | ---------------------------- |
| `qep.requirement.created`          | `RequirementCreated`         |
| `qep.requirement.updated`          | `RequirementUpdated`         |
| `qep.requirement.archived`         | `RequirementArchived`        |
| `qep.requirement.approved`         | `RequirementApproved`        |
| `qep.requirement.rejected`         | `RequirementRejected`        |
| `qep.requirement.version_created`  | `RequirementVersionCreated`  |
| `qep.requirement.baseline_created` | `RequirementBaselineCreated` |

## Envelope fields (base)

`eventId`, `occurredAt`, `correlationId`, `tenantId`, `requirementId`

## Deferred

Publishing, subscribers, outbox, and bus wiring are **out of scope** until authorised programmes after ENG-020A.
