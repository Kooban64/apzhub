# ADR-0039 — Jurisdiction-Adaptive Compliance Profile

> **Status:** Accepted (planning)  
> **Date:** 2026-07-06  
> **Story:** LAW-015-01  
> **Authority:** [LAW-Trust-Accounting-Reference-Architecture](../architecture/LAW-Trust-Accounting-Reference-Architecture.md) § South African Compliance

---

## Context

Trust accounting regulations vary by jurisdiction. South African legal practice (Legal Practice Act, LPC rules) is the **primary design target** for Phase 1 validation. Future expansion to other jurisdictions must not require rewriting the ledger engine.

---

## Decision

Compliance requirements are expressed as **Jurisdiction Compliance Profiles** attached to the tenant (firm) or trust account:

- Profile defines: required reconciliation frequency, interest posting rules reference, statement formats, reference numbering conventions, segregation rules, and audit export fields.
- **South Africa (`ZA-LPC`)** is the default profile for Law Platform v1.0 trust validation.
- Calculation engines (interest rates, statutory minimums) are **pluggable strategy references** — profiles declare _what_ must happen; strategies implement _how_ at implementation stories (LAW-015-06+).
- No jurisdiction-specific logic in Platform 5.0 frameworks.

Profile schema is documented in the specification; **no calculations are encoded in LAW-015-01**.

---

## Alternatives considered

| Alternative                              | Rejected because                                 |
| ---------------------------------------- | ------------------------------------------------ |
| Hard-code SA rules in ledger             | Blocks international expansion                   |
| Per-country code forks                   | Unmaintainable; violates capability model        |
| Configuration-only with no profile model | Insufficient structure for audit rule validation |

---

## Consequences

- Firm Administration (LAW-011) eventually hosts profile selection — not in LAW-015-01 scope.
- Trust Account entity carries `complianceProfileId` reference.
- Implementation stories must test against `ZA-LPC` profile fixtures.

---

## Related

- [LAW-Trust-Accounting-Specification](../specs/LAW-Trust-Accounting-Specification.md) § Compliance Profiles
- [LAW-Trust-Accounting-Reference-Architecture](../architecture/LAW-Trust-Accounting-Reference-Architecture.md) § South African Compliance
