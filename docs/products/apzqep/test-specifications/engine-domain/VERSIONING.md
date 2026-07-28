# Versioning — APZQEP-ENG-050A

## Model

- Major / minor integers with label `major.minor`
- Initial create defaults to `0.1`
- `SpecificationVersionService.bump(current, "major" | "minor")`
- Version labels unique within aggregate lineage
- Older approved versions become immutable via supersession / retirement

## Supersession

1. `createSuccessorDraft(approved, { bump, id, … })` creates a new Draft aggregate with predecessor link and comparison notes.
2. `supersedeSpecification(predecessor, successorId, …)` marks the Approved predecessor as `superseded` (non-authoritative, immutable).

## Authoritative version

- `isAuthoritative === true` only when status is `approved`
- At most one authoritative version is intended per lineage (enforced per aggregate; cross-aggregate uniqueness is an infrastructure concern for a later programme)
- `SpecificationVersionService.latestApprovedLabel` selects the latest authoritative approved label from a set of records
