# Domain Model — Requirements Bounded Context

> **Programme:** APZQEP-ENG-020A  
> **Package:** `packages/qep-requirements/src/domain`

## Aggregate root

| Object                  | Kind           | Notes                                                                                                                   |
| ----------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Requirement`           | Aggregate root | Identity, key, title, type, status, priority, approval, version, criteria, attributes, references, tenant/project scope |
| `RequirementCollection` | Collection     | Unique-by-id collection helper; not a persistence store                                                                 |

## Identity & classification

| Object                         | Kind                         |
| ------------------------------ | ---------------------------- |
| `RequirementId`                | Value object (`req_*`)       |
| `RequirementType`              | Value object enum            |
| `RequirementStatus`            | Value object enum            |
| `RequirementPriority`          | Value object enum            |
| `RequirementCategory`          | Value object                 |
| `RequirementReference`         | Value object                 |
| `RequirementVersion`           | Value object (semver triple) |
| `RequirementBaselineReference` | Value object                 |
| `RequirementOwner`             | Value object                 |
| `RequirementApprovalState`     | Value object enum            |
| `RequirementAttributes`        | Value object                 |
| `AcceptanceCriteria`           | Value object                 |
| `RequirementRelationship`      | Value object                 |

## Construction

Factories (`createRequirement`, `createRequirementId`, …) enforce invariants in the domain layer. No infrastructure or application orchestration is required to construct valid instances.

## Explicit non-goals (ENG-020A)

- No persistence mapping
- No lifecycle workflows (approve/reject/baseline as behaviour)
- No cross-aggregate orchestration beyond pure collection helpers
