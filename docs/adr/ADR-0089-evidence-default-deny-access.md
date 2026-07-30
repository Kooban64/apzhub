# ADR-0089 — Default-Deny Evidence Access

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0089**                                                            |
| Title     | Default-Deny Evidence Access (extends L-02)                             |
| Status    | **Accepted** (APZQEP-ARCH-016 Owner Architecture Acceptance 2026-07-30) |
| Date      | 2026-07-30                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-016                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

REM-001 / CERT-002 closed L-02 by making Test Execution evidence access fail-closed. Evidence Management must not reintroduce default-allow patterns at platform scale.

## Decision

Evidence access is **default-deny**. Only an affirmative allow outcome grants access. Missing policy, missing ACL grant, indeterminate results, and errors **SHALL** deny. Tenant isolation is mandatory. Downloads and exports occur only through authorised EvidenceService paths.

When live, TE `EvidenceAccessPort` **SHOULD** delegate to this model.

## Consequences

- Aligns with Zero Trust (013) and verified L-02 principle.
- Workbench cannot grant access client-side.
- Observability must distinguish deny reasons without leaking content.

## Related

- docs/products/apzqep/evidence-management/OES-ARCH-016/PART-04.md
- docs/products/apzqep/test-execution/REM-001/
- docs/products/apzqep/test-execution/CERT-002/
