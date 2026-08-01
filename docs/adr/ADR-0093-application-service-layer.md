# ADR-0093 — Application Service Layer

| Item      | Value                                                               |
| --------- | ------------------------------------------------------------------- |
| ADR       | **ADR-0093**                                                        |
| Title     | Application Service Layer (One Service per Major Domain Capability) |
| Status    | **Accepted**                                                        |
| Date      | 2026-08-01                                                          |
| Product   | APZHUB / APZQEP                                                     |
| Programme | Product Board guidance after APZQEP-120-S02                         |
| Deciders  | Owner / APZOR Engineering                                           |

---

## Context

APZQEP-120-S01 established Evidence ACL semantics. APZQEP-120-S02 established a permission-aware Evidence enumeration pipeline (`EvidenceEnumerationService` / query path) that reuses those semantics without a second authorisation framework.

Without a portfolio rule, later domains risk scattering business behaviour across controllers, repositories, and ad-hoc helpers.

## Decision

1. Every major domain capability **SHALL** converge on **exactly one primary Application Service** (or a tightly paired Command + Query service where CQRS is justified).
2. **Controllers / handlers** are thin orchestration: auth context, validation envelope, call service, map response.
3. **Repositories** are persistence only — no permission evaluation, no product business rules.
4. **Application Services** own business behaviour: validation, orchestration, permission-aware queries, lifecycle rules, audit hooks.
5. Later capabilities (Requirements, Test Specs, Suites, Runs, Defects, Release, Certification, etc.) **SHOULD** follow the same pattern proven by Evidence after S01/S02.
6. Do **not** invent a second authorisation framework per domain — reuse platform PermissionService / domain policy engines as established.

### Illustrative targets (not a delivery backlog)

```text
EvidenceQueryService / Evidence command services
RequirementService · RequirementQueryService
TestCaseService · TestRunService · SuiteService
DefectService · ReleaseService · CertificationService
```

## Consequences

- Consistent layering across APZQEP and reusable patterns across the APZHUB portfolio.
- Controllers stay thin; repositories stay dumb; services stay authoritative.
- Slice designs (APZHUB-ENG-001) can reference this ADR instead of re-arguing layering.

## Related

- [ADR-0092](./ADR-0092-engineering-slice-standard-freeze.md) — Engineering Slice Standard freeze
- APZQEP-120-S01 / S02 engineering notes
- Foundation [003](../003-overall-system-architecture-design-principles.md) · [009](../009-platform-service-layer-business-logic-architecture.md)
