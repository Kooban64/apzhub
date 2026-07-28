# Platform 1.4 Proposed Roadmap

> Statuses are **PROPOSED / RECOMMENDED / CONDITIONAL**. None are ACTIVE implementation programmes.

## 1. Architecture programmes

| ID                    | Title                                        | Classification | Status       | Objective                          |
| --------------------- | -------------------------------------------- | -------------- | ------------ | ---------------------------------- |
| Platform-1.4-ARCH-001 | Architecture Confirmation and Delivery Scope | ARCHITECTURE   | **ACCEPTED** | Define theme, scope, ADRs, roadmap |

## 2. ADR programmes (proposed)

| ID                    | Title                                    | Status                                    | Dependencies          |
| --------------------- | ---------------------------------------- | ----------------------------------------- | --------------------- |
| Platform-1.4-ADR-0073 | Durable Notification Runtime Persistence | **ACCEPTED** · Option A                   | ARCH-001 **ACCEPTED** |
| Platform-1.4-ADR-0074 | External Transactional Delivery Provider | **CONDITIONAL** · REQUIRES OWNER APPROVAL | ADR-0073 · POPIA      |
| Platform-1.4-ADR-0075 | Multi-instance SSE Fan-out (if needed)   | **CONDITIONAL / DEFERRED**                | E02 evidence          |

## 3. Engineering programmes (proposed — not authorised)

| ID                       | Title                                          | Status                                                              | Dependencies             |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------- | ------------------------ |
| Platform-1.4-ENG-001A    | Durable Notification Runtime Technical Design  | **ACCEPTED**                                                        | ADR-0073 **ACCEPTED**    |
| Platform-1.4-ENG-001B-P0 | Durable Notification Runtime Phase 0           | **ACCEPTED**                                                        | ENG-001A **ACCEPTED**    |
| Platform-1.4-ENG-001B-P1 | Durable Notification Runtime Phase 1           | **ACCEPTED**                                                        | ENG-001B-P0 **ACCEPTED** |
| Platform-1.4-ENG-001B-P2 | Durable Notification Runtime Phase 2           | **ACCEPTED**                                                        | ENG-001B-P1 **ACCEPTED** |
| Platform-1.4-ENG-001B-P3 | Durable Notification Runtime Phase 3           | **ACCEPTED**                                                        | ENG-001B-P2 **ACCEPTED** |
| Platform-1.4-ENG-001B-P4 | Durable Notification Runtime Phase 4           | **ACCEPTED**                                                        | ENG-001B-P3 **ACCEPTED** |
| Platform-1.4-ENG-001B-P5 | Durable Notification Runtime Phase 5           | **PROPOSED / BLOCKED**                                              | Engineering closed       |
| Platform-1.4-OR-001      | Platform 1.4 Operational Readiness Validation  | **ACCEPTED**                                                        | ENG-001B-P4 **ACCEPTED** |
| Platform-1.4-REM-001     | Platform 1.4 Operational Readiness Remediation | **ACCEPTED**                                                        | OR-001 **ACCEPTED**      |
| Platform-1.4-BLD-001     | Platform 1.4 Build & Release Validation        | **ACCEPTED**                                                        | REM-001 **ACCEPTED**     |
| Platform-1.4-CERT-001    | Platform 1.4 Production Certification          | **ACCEPTED** · **PRODUCTION READY WITH OPERATIONAL QUALIFICATIONS** | BLD-001 **ACCEPTED**     |
| Platform-1.4-ENG-002     | Capacity & Resilience Evidence Harness         | **RECOMMENDED**                                                     | ARCH-001                 |
| Platform-1.4-ENG-003     | Delivery/Realtime Administration Maturity      | **CONDITIONAL**                                                     | ENG-001                  |
| Platform-1.4-ENG-004     | External Transactional Provider Adapter        | **CONDITIONAL**                                                     | ADR-0074 · POPIA         |
| Platform-1.4-ENG-005     | Release Automation Improvements                | **CONDITIONAL**                                                     | ARCH-001                 |

## 4. Compliance / operational readiness

| ID                    | Title                                  | Status          |
| --------------------- | -------------------------------------- | --------------- |
| Platform-1.4-COMP-001 | POPIA Production Readiness Evidence    | **RECOMMENDED** |
| Platform-1.4-OPS-001  | Operational Runbooks & Enablement Pack | **RECOMMENDED** |

## 5. Quality / certification

| ID                    | Title                                 | Status                                                              |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| Platform-1.4-QA-001   | Full Monorepo + Playwright Portfolio  | **RECOMMENDED**                                                     |
| Platform-1.4-CERT-001 | Platform 1.4 Production Certification | **ACCEPTED** · **PRODUCTION READY WITH OPERATIONAL QUALIFICATIONS** |
| Platform-1.4-RR-001   | Remediation (if needed)               | **PROPOSED**                                                        |
| Platform-1.4-CERT-002 | Final Production Certification        | **PROPOSED**                                                        |

## Acceptance authority

All ADR/ENG/COMP/QA/CERT programmes require **named Owner Approval** before start. ARCH-001 does not authorise them.
