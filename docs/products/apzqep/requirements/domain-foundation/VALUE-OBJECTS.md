# Value Objects — Requirements Domain

> **Programme:** APZQEP-ENG-020A

| Value object                   | Validation / form                                            |
| ------------------------------ | ------------------------------------------------------------ |
| `RequirementId`                | `^req_[a-zA-Z0-9_-]{1,64}$`                                  |
| `RequirementType`              | Closed set (e.g. functional, business, non_functional, …)    |
| `RequirementStatus`            | Closed set (e.g. draft, under_review, approved, archived, …) |
| `RequirementPriority`          | Closed set (low, medium, high, critical)                     |
| `RequirementCategory`          | Non-empty trimmed string ≤ 128 chars                         |
| `RequirementReference`         | External/system reference descriptor                         |
| `RequirementVersion`           | Non-negative major/minor/patch integers                      |
| `RequirementBaselineReference` | Baseline identity reference                                  |
| `RequirementOwner`             | Owner identity reference                                     |
| `RequirementApprovalState`     | Closed set (not_submitted, pending, approved, rejected, …)   |
| `RequirementAttributes`        | Tags + string custom map                                     |
| `AcceptanceCriteria`           | Non-empty list of criterion strings                          |
| `RequirementRelationship`      | Kind + from/to ids; rejects self-links                       |

Invalid construction throws `QepInvariantViolation` (`shared/errors`).
