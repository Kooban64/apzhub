# ADR-0076 — Execution Manifest Source Integrity

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0076**                                                            |
| Title     | Execution Manifest Source Integrity                                     |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Plans and specifications may change after an execution starts; historical truth must be preserved.

## Decision

Seal an **ExecutionManifest** at prepare (no later than start) containing immutable version refs and resolved step snapshots. Live source changes MUST NOT rewrite sealed executions.

## Consequences

Enables auditability and re-execution via new executions/supersession.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
