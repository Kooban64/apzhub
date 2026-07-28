# Owner Acceptance — APZQEP-ENG-020E

> **Decision:** **ACCEPTED / CLOSED / COMPLETE**  
> **Date:** 2026-07-26  
> **Authority:** Owner Acceptance — Requirements Baselines

## Decision record

| Field | Value |
| ----- | ----- |
| Programme | APZQEP-ENG-020E — Requirements Baselines |
| Decision | **ACCEPTED / CLOSED / COMPLETE** |
| Package | `@apzhub/qep-requirements` **0.7.0** |
| Implementation evidence | `docs/operations/evidence/portfolio-recert/20260725T174800Z-APZQEP-ENG-020E-PART1.json`, `20260725T190000Z-APZQEP-ENG-020E-PART2.json`, `20260725T203000Z-APZQEP-ENG-020E.json` |
| Acceptance evidence | `docs/operations/evidence/portfolio-recert/20260726T080000Z-APZQEP-ENG-020E-ACCEPTANCE.json` |
| Documentation pack | `docs/products/apzqep/requirements/baselines/` |

## Acceptance assessment (Owner)

| Area | Result |
| ---- | ------ |
| Domain and architecture | PASS |
| Configuration management integrity | PASS |
| Persistence and tenancy | PASS |
| Integrity | PASS |
| Application and API | PASS |
| Authorisation and security | PASS |
| Platform integration | PASS |
| Workbench user experience | PASS |
| Comparison | PASS |
| Accessibility | PASS WITH DOCUMENTED EVIDENCE LIMITATION |
| Operational readiness | PASS |
| Quality evidence | PASS |

## Binding foundations (authoritative)

1. Requirement Baselines are governed configuration items.
2. Baselines contain immutable Requirement Content Versions only.
3. Baselines never contain mutable “latest Requirement” references.
4. Draft Baselines may change.
5. Locked Baselines are permanently immutable.
6. Archived Baselines remain immutable.
7. Empty Baselines cannot be locked.
8. One Baseline cannot contain duplicate Content Versions.
9. One Baseline cannot contain multiple versions of the same Requirement.
10. Baseline integrity is calculated server-side (SHA-256; not a legal signature).
11. Baseline comparison is membership-based.
12. Requirement content comparison remains owned by Requirements Versioning (ENG-020D).
13. Baseline permissions are server-enforced.
14. Platform Audit remains authoritative.
15. Baseline lifecycle and integrity rules must not be copied into client code as authority.
16. No unlock, restore or ordinary delete capability exists.
17. Downstream QEP domains shall consume governed Requirements configurations rather than mutable Requirements where a fixed quality scope is required.
18. Governance reconciliation remains mandatory before Owner Acceptance.

## Next programme gate

**APZQEP-ENG-020F — Requirements Relationship Model** is the next Requirements capability and is **PLANNING ONLY**.

It is a foundational semantic capability upon which Traceability, Coverage Analysis, Verification, Test Specifications, Test Cases, Test Execution, Evidence and Certification will depend. Implementation is deferred until the complete Owner Architecture Specification has been produced and approved.

Do **not** create ENG-020F code, migrations, packages, APIs, UI, persistence, repositories, or documentation packs at this time.
