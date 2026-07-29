# SECURITY-DESIGN — APZQEP-REM-001

## Principle

```text
NO EXPLICIT AUTHORISATION = NO ACCESS
```

## Decision model

`EvidenceAccessDecision.outcome`:

| Outcome           | Grants access? | Assert behaviour                                      |
| ----------------- | -------------- | ----------------------------------------------------- |
| `allowed`         | Yes            | Success                                               |
| `denied`          | No             | `ExecutionForbiddenError`                             |
| `indeterminate`   | No             | `ExecutionForbiddenError`                             |
| `unavailable`     | No             | `ExecutionForbiddenError`                             |
| `invalid_request` | No             | `ExecutionValidationError` (malformed/empty URI etc.) |

## Enforcement layers

1. **Gateway / authn** — existing platform pipeline (unchanged).
2. **PermissionPort** — execute/admin/wildcard required for associate.
3. **EvidenceAccessPort** — affirmative accessibility decision required.
4. **Tenant isolation** — repository / query keyed by `tenantId` (not-found pattern).
5. **Workbench** — reflects `availableActions` and server errors only; never decides access.

## Baseline policy

`createBaselineEvidenceAccessCheck()` affirmatively allows only when:

- actor `userId` and `tenantId` present
- URI parses and uses an allowed scheme (`https`, `http`, `s3`, `apz-evidence`)

This is an **explicit** production policy result, distinct from “check missing”.

## Conditions that never grant access

Missing permission data · missing policy result · unsupported scheme · unknown/undefined response · null · adapter failure · timeout · configuration omission · unregistered handler · unexpected exception.

## Actions

Port evaluates `associate` | `view_metadata` | `list` | `download`.

Current product surface uses **`associate`** on evidence-reference association. List/metadata remain gated by execution read + tenant. Download of blobs is **not** implemented in this package (ADR-0080 references only).

## Audit

On associate denial, Application appends `evidence_access_denied` (no URI contents / secrets in details). Mutation success continues to use existing audit path.
