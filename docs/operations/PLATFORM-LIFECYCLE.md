# Platform Lifecycle (Operating Model)

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [ENGINEERING-OPERATING-MODEL](./ENGINEERING-OPERATING-MODEL.md) · [APZHUB-FOUNDATION-001](../foundation/APZHUB-FOUNDATION-001-Platform-Foundation-Completion-Report.md) · Document 003 · Freeze notices

---

## Purpose

Lifecycle for platform capabilities after Platform Foundation **CLOSED**. Platform work is exceptional: product need, operational necessity, or ADR + Owner.

---

## Stages

```text
Proposal
  → ADR
  → Implementation
  → Certification
  → Platform Release
  → Maintenance
```

| Stage                | Outcome                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **Proposal**         | Problem/opportunity; product blocker or ops need stated                                  |
| **ADR**              | Architecture Decision Record; freeze impact assessed; Owner Approval for freeze/breaking |
| **Implementation**   | Named programme; Definition of Ready met; services/adapters/packages only as scoped      |
| **Certification**    | Tests + audit/certify commands; no silent public API break                               |
| **Platform Release** | SemVer + release evidence + KF status update                                             |
| **Maintenance**      | Patches; further features need new Proposal/ADR/programme                                |

---

## Rules

1. Prefer fixing at the **product** layer by consuming existing platform capabilities.
2. Do not reopen Platform Foundation as a phase.
3. Frozen subsystems (SDK, Search, Documents, Workflow, etc.) require ADR + Owner.
4. Platform Services remain the home of business rules; adapters stay integration-only.
5. Module → Service → Connector → Engine never bypassed.

---

## Relationship to products

```text
Product programme blocked?
  → Can existing platform capability suffice? → use it
  → Else Proposal + ADR + Owner-approved platform programme
  → Then resume product programme
```

Reference pattern: [Product Engineering Reference Implementation](../products/APZHUB-PRODUCT-ENGINEERING-REFERENCE-IMPLEMENTATION.md).
