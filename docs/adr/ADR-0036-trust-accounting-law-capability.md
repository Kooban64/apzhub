# ADR-0036 — Trust Accounting as Law Platform Capability

> **Status:** Accepted (planning)  
> **Date:** 2026-07-06  
> **Story:** LAW-015-01  
> **Authority:** [LAW-Trust-Accounting-Reference-Architecture](../architecture/LAW-Trust-Accounting-Reference-Architecture.md)

---

## Context

Trust Accounting is a regulated financial subsystem required for law firm operations. South African legal practice imposes strict client fund segregation, audit readiness, and reconciliation obligations under the Legal Practice Act and Legal Practice Council expectations.

The Law Platform must deliver Trust Accounting without modifying Platform 5.0 frameworks or duplicating ledger, event, persistence, or API infrastructure.

---

## Decision

Trust Accounting is implemented as a **Law Platform business capability** (`services/legal-trust/` or equivalent) that:

1. Consumes Platform 5.0 frameworks exclusively (Runtime, Workbench, Action, Knowledge, Event/Notification, Activity/Timeline, Persistence, API).
2. Does **not** introduce a parallel `@apzhub/trust-framework` or platform-level ledger engine.
3. Owns domain types in `@apzhub/legal-business-core` (extended) and workflow services under the Law Platform layer.
4. Exposes integration through manifest-declared events, actions, permissions, and future REST APIs — not direct cross-module database access.

---

## Alternatives considered

| Alternative                          | Rejected because                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Platform-level Trust Framework (M9+) | Violates product validation scope; platform frozen at 5.0                                       |
| Third-party accounting engine as SoR | Client funds require firm-controlled immutable journal; external SoR conflicts with audit model |
| Billing module extension only        | Trust ledger semantics (segregation, reconciliation, interest) exceed invoice scope             |

---

## Consequences

- All Trust stories cite platform frameworks validated.
- Jurisdiction rules are **profiles** on the capability, not hard-coded platform behaviour.
- Implementation begins at LAW-015-02 after owner approval of LAW-015-01 planning package.

---

## Related

- ADR-0037 — Immutable Trust Journal
- ADR-0038 — Matter Trust Balance Segregation
- ADR-0039 — Jurisdiction-Adaptive Compliance Profile
