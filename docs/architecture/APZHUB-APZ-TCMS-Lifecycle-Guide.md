# APZ TCMS — Lifecycle Guide

**Milestone:** APZTCMS-004

## Test case / plan / suite statuses

Canonical path:

`draft → review → approved → deprecated → archived`

- `ready` remains for backward compatibility and is treated as equivalent to `approved` for many transitions via `canonicalizeTestStatus`.
- Illegal jumps (e.g. `draft → approved`) are rejected by domain services.

## Manual execution statuses

`planned | queued → in_progress ⇄ paused → completed`  
Cancel maps to `aborted`. Restart creates a new execution linked via `restartOfId`.

## Approval statuses

`pending → approved | rejected | conditional | rework | withdrawn`  
Rework returns work to authors; history is append-only.

## Versioning

- Plans / suites: increment `versionNumber` via `version()`.
- Cases: persist immutable snapshots in `testing_test_case_version` with a `CaseVersionReason`.

## Related

- [State Machines](./APZHUB-APZ-TCMS-State-Machines.md)
- [Validation Rules](./APZHUB-APZ-TCMS-Validation-Rules.md)
