# ADR-0084 — External Result Ingestion Trust Boundary

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0084**                                                            |
| Title     | External Result Ingestion Trust Boundary                                |
| Status    | **Accepted** (APZQEP-ARCH-015 Owner Architecture Acceptance 2026-07-28) |
| Date      | 2026-07-28                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-015                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

External systems will submit results; trust and idempotency are mandatory.

## Decision

Define ExternalExecutionSubmission with authn/authz, schema validation, source registration, idempotency, integrity checks, duplicate detection, quarantine/reject, and refusal to mutate cancelled/accepted finals.

## Consequences

Safe automation integration without corrupting history.

## Related

- docs/products/apzqep/test-execution/OES-ARCH-015/COMPLETE.md
- docs/products/apzqep/STANDING-PROGRAMME-RECORD.md
