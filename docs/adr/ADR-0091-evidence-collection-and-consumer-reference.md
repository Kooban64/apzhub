# ADR-0091 — Collections vs Sets; Consumer EvidenceReference

| Item      | Value                                                                   |
| --------- | ----------------------------------------------------------------------- |
| ADR       | **ADR-0091**                                                            |
| Title     | Collections vs Sets; Consumer EvidenceReference                         |
| Status    | **Accepted** (APZQEP-ARCH-016 Owner Architecture Acceptance 2026-07-30) |
| Date      | 2026-07-30                                                              |
| Product   | APZ QEP                                                                 |
| Programme | APZQEP-ARCH-016                                                         |
| Deciders  | Owner / APZOR Engineering                                               |

---

## Context

Grouping evidence for executions, runs, and certification must not blur SoR ownership or freeze packs prematurely.

## Decision

- **EvidenceCollection** = mutable working group (membership changes audited).
- **EvidenceSet** = immutable sealed snapshot (ADR-0090).
- Consumers **MAY** store local **EvidenceReference** for UX/performance; discovery SoR for associations **SHOULD** remain queryable via EvidenceService relationships.

## Consequences

- Working packs and certification packs are distinct.
- Local references never become content SoR.
- Reinforces ADR-0080 / ADR-0087.

## Related

- docs/products/apzqep/evidence-management/OES-ARCH-016/PART-02.md
