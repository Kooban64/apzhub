# Contracts — Requirements Domain Foundation

> **Programme:** APZQEP-ENG-020A  
> **Rule:** Interfaces only — no implementations

## Domain services

| Interface                        | Purpose (future)                           |
| -------------------------------- | ------------------------------------------ |
| `RequirementService`             | Core domain operations / mutability guards |
| `RequirementValidationService`   | Domain validation rules                    |
| `RequirementRelationshipService` | Relationship integrity                     |
| `RequirementVersionService`      | Versioning rules                           |
| `RequirementApprovalService`     | Approval state transitions                 |

## Repository ports

| Interface                           | Purpose (future)              |
| ----------------------------------- | ----------------------------- |
| `RequirementRepository`             | Requirement persistence port  |
| `RequirementVersionRepository`      | Version history port          |
| `RequirementRelationshipRepository` | Relationship persistence port |

## Application services

| Interface                       | Purpose (future)                            |
| ------------------------------- | ------------------------------------------- |
| `RequirementApplicationService` | Application orchestration entry (ENG-020B+) |

## Infrastructure

`src/infrastructure` exports `QEP_REQUIREMENTS_INFRASTRUCTURE_STATUS = "not_implemented"` only.
