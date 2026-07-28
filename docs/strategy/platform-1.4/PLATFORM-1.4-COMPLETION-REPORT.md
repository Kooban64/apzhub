# Platform-1.4-ARCH-001 Completion Report

> **Status:** **ACCEPTED** (Owner Decision — Platform-1.4-ADR-0073 bootstrap)  
> **Date:** 2026-07-23  
> **Classification:** ARCHITECTURE CONFIRMATION  
> **Baseline:** Platform 1.4 · Predecessor Platform 1.3 CLOSED PRWL

## Programme

**Platform-1.4-ARCH-001** — Platform 1.4 Architecture Confirmation and Delivery Scope

## Precondition Verification

**PASS** — see [PRECONDITION-VERIFICATION.md](./PRECONDITION-VERIFICATION.md). CERT-002 **ACCEPTED**; Platform 1.3 **CLOSED** as **PRODUCTION READY WITH LIMITATIONS**.

## Platform 1.4 Proposed Release Theme

**Production Operational Maturity for Durable Notification Delivery & Shared-Host Resilience**

## Executive Summary

Platform 1.4 is defined as a deliberate operational-maturity release on the frozen Platform 1.3 architecture. It prioritises durable notification runtime, capacity evidence, POPIA/compliance preconditions, and honest full regression/Playwright certification. It does **not** unlock Email SoR, Workflow Execute, FIN-001, or WebSockets. Required ADRs are identified (0073–0075 placeholders). No implementation occurred under this programme.

## Business / Architecture Drivers

See [PLATFORM-1.4-BUSINESS-DRIVERS.md](./PLATFORM-1.4-BUSINESS-DRIVERS.md) · [PLATFORM-1.4-ARCHITECTURE-DRIVERS.md](./PLATFORM-1.4-ARCHITECTURE-DRIVERS.md).

## Inherited Architecture / Confirmation

Layering **RETAIN**. Components classified RETAIN / EXTEND ADDITIVELY / REQUIRES ADR as documented. ADR-0070/0071/0072 unchanged.

## Residual Review

Every CERT-002 residual classified — see [PLATFORM-1.4-RESIDUAL-REVIEW.md](./PLATFORM-1.4-RESIDUAL-REVIEW.md).

## Scope

| Level    | Summary                                                                                    |
| -------- | ------------------------------------------------------------------------------------------ |
| MUST     | Durable runtime · capacity evidence · POPIA pack · full regression/Playwright · CERT train |
| SHOULD   | Admin maturity · runbooks · release automation · conditional transactional provider        |
| MAY      | Preference improvements · light Observe/Support/Search ops                                 |
| WILL NOT | See exclusions                                                                             |

## Candidate Epics

| Class       | Epics                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Recommended | E01 Durable Runtime · E02 Capacity · E03 POPIA · E04 Full Regression/Playwright |
| Conditional | E05 Admin · E06 Provider · E07 Release Automation                               |
| Deferred    | E10 Product integration maturity                                                |
| Excluded    | E08/E09 implementation (Workflow Execute / Email SoR)                           |

## Required ADRs

ADR-0073 (durable runtime) · ADR-0074 (provider, conditional) · ADR-0075 (SSE fan-out, conditional).

## Domain assessments

### Notification Delivery

Phase A in-app certified; process-local runtime is the primary 1.4 gap; 0065 schema ready; SMTP deferred; provider abstraction mature enough for adapter extension. **Prioritise durable runtime first; external provider only after ADR + POPIA.**

### Realtime

ADR-0072 SSE-only remains. Need capacity evidence; process-local buffers acceptable for single-instance; multi-instance fan-out only if E02 proves need (**ADR-0075**). **No WebSockets.**

### Observe

ENG-002 + delivery hook sufficient for 1.4 MUST; retain ownership; light ops MAY only.

### Support

SSE delivered; attachment delete residual deferred; notification intent path retained; no Support chat.

### Search

ENG-001 closed PL12-KL-01; do not reopen Search architecture without new evidence; diagnostics MAY only.

### Workflow Execute gate

**KEEP GATED** — missing execution authz, secrets, audit, rollback, human approval architecture for unlock.

### Email SoR gate

**REMAIN EXCLUDED** — no demonstrated Owner-authorised product requirement for mailbox/inbound/archive; transactional provider ≠ Email SoR.

### FIN-001 gate

**REMAIN STOPPED** — financial controls and ownership prerequisites unmet; no 1.4 MUST dependency.

## Security / POPIA / Data / Infra / Ops / Quality / Certification

Documented in respective pack files. Certification model retains proven CERT → RR → re-CERT chain.

## Dependency Sequence

ARCH → ADR-0073 → ENG E01; parallel E02/E04; COMP-001; conditional ADR-0074 → E06; then CERT.

## Risks / Known Limitations / Success Criteria / Roadmap / Exclusions

Filed in pack.

## Source / package / database changes

**None.** No application source · no package source · no migrations · no provider implementation · no Platform 1.4 engineering started.

## Recommendation

**READY FOR OWNER ARCHITECTURE ACCEPTANCE**

## STOP

Await Owner Architecture Acceptance. Do not begin ADR or engineering programmes.
