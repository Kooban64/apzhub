# Value Objects — APZQEP-ENG-050A

Immutable branded / structured values:

| VO | Notes |
| -- | ----- |
| SpecificationId | `tsp_[A-Za-z0-9_-]+` |
| SpecificationNumber | Non-empty ≤ 64 |
| SpecificationTitle | Non-empty ≤ 240 |
| SpecificationDescription / Objective / Scope | Non-empty ≤ 8000 |
| SpecificationStatus | draft, under_review, approved, rejected, withdrawn, superseded, cancelled, retired |
| SpecificationVersion | `{ major, minor, label }` |
| SpecificationPriority | critical, high, medium, low |
| SpecificationComplexity | trivial, simple, moderate, complex, epic |
| SpecificationClassification | Required free-text classification |
| SpecificationOwner / Reviewer / Author | Required actor ids |
| SpecificationType | Functional…Cloud catalogue (extensible list in constants) |
| SpecificationPreconditions / Postconditions / AcceptanceCriteria | Ordered non-empty items |
| SpecificationRisk / Dependency | Identity + summary (+ optional severity/reference) |
| SpecificationReference | kind + artefactId (+ owningDomain/label) |
| SpecificationTag | Non-empty ≤ 64 |
| SpecificationTimestamp | Valid ISO date string |

Factory functions throw `TestSpecificationInvariantViolation` on invalid input.
