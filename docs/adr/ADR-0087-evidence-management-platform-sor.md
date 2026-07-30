# ADR-0087 — Evidence Management as Platform Evidence SoR

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0087**                                                            |
| Title     | Evidence Management as Platform Evidence SoR                            |
| Status    | **Accepted** (APZQEP-ARCH-016 Owner Architecture Acceptance 2026-07-30) |
| Date      | 2026-07-30                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-016                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Quality evidence is produced and consumed across Test Execution and future Runs, Defects, Reporting, Analytics, AI, and Compliance. Without a single SoR, each capability risks duplicating blobs, lifecycles, and access rules.

## Decision

**Evidence Management** is the sole authoritative System of Record for evidence identity, content locators, integrity, classification, ownership, access, lifecycle, retention, disposition, provenance, collections, and sealed sets.

Consumers hold **EvidenceReference** only and **SHALL NOT** treat local copies of content as SoR. This completes the target anticipated by ADR-0080.

## Consequences

- Future capabilities integrate by reference.
- TE keeps EvidenceReference ownership of its association records.
- Engineering must not invent parallel evidence stores.

## Related

- docs/products/apzqep/evidence-management/OES-ARCH-016/COMPLETE.md
- docs/adr/ADR-0080-test-execution-evidence-boundary.md
