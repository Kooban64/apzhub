# ADR-0088 — Evidence Storage Abstraction

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0088**                                                            |
| Title     | Evidence Storage Abstraction (Metadata vs Content)                      |
| Status    | **Accepted** (APZQEP-ARCH-016 Owner Architecture Acceptance 2026-07-30) |
| Date      | 2026-07-30                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-016                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Evidence includes large binary content. Binding the domain to a specific object store early creates unnecessary coupling and host-coexistence risk.

## Decision

Separate **metadata SoR** (platform database) from **content bytes** behind a **StoragePort**. Architecture does not select storage technology. Eng Spec / later ADR chooses technology against NFRs without changing the SoR model.

## Consequences

- Adapters remain replaceable.
- Consumers never call storage engines directly.
- Integrity metadata lives with Evidence aggregate, not only in the storage product.

## Related

- docs/products/apzqep/evidence-management/OES-ARCH-016/PART-04.md
