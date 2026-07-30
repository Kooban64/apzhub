# ADR-0090 — Evidence Sealing and EvidenceSet

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0090**                                                            |
| Title     | Evidence Sealing and EvidenceSet                                        |
| Status    | **Accepted** (APZQEP-ARCH-016 Owner Architecture Acceptance 2026-07-30) |
| Date      | 2026-07-30                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-016                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Certification and compliance require immutable evidence packs. Mutable collections alone are insufficient for lock-on-certify behaviour.

## Decision

Individual evidence may be **Sealed / Locked** (content + critical integrity fields immutable). An **EvidenceSet** is an immutable snapshot of collection membership with seal metadata, used for certification-grade packs. Sealing emits provenance and audit events. Legal hold blocks disposition of sealed and unsealed evidence alike.

## Consequences

- Clear certification pack model for M09.
- Pre-seal replacements use EvidenceVersion lineage.
- Disposition remains an explicit authorised act.

## Related

- docs/products/apzqep/evidence-management/OES-ARCH-016/PART-03.md
