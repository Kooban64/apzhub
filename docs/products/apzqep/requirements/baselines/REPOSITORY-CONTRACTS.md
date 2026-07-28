# Repository Contracts

Port: `RequirementBaselineRepository` in `@apzhub/qep-requirements`.

## Supported operations

CreateBaseline, GetBaseline, UpdateDraftBaseline, ListBaselines,
AddRequirementVersion, RemoveRequirementVersion, LockBaseline,
ArchiveBaseline, BaselineExists, BaselineNumberExists, ListBaselineItems,
nextBaselineNumber, listBaselinesForRequirement, recordIntegrityVerification.

## Explicitly absent

- UnlockBaseline
- DeleteBaseline
- ModifyLockedBaseline
- RestoreBaseline
- CloneBaseline

Production uses PostgreSQL. In-memory adapters exist for tests only and must
not be used as a silent production fallback.
