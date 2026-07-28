# Platform-1.4-ADR-0073 — Durable Notification Runtime Architecture Decision

> **Status:** **ACCEPTED** (Owner Decision — Platform-1.4-ENG-001A bootstrap)  
> **Classification:** ARCHITECTURE DECISION RECORD  
> **Baseline:** Platform 1.4  
> **Parent:** Platform-1.4-ARCH-001 **ACCEPTED**  
> **Decision:** **Option A — PostgreSQL-Owned Durable Runtime**  
> **Date:** 2026-07-23

## Pack

| Document                           | Path                                                                                                                                                                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preconditions                      | [PRECONDITION-VERIFICATION.md](./PRECONDITION-VERIFICATION.md)                                                                                                                                                                                  |
| Current state                      | [CURRENT-STATE-ASSESSMENT.md](./CURRENT-STATE-ASSESSMENT.md)                                                                                                                                                                                    |
| Problem                            | [PROBLEM-STATEMENT.md](./PROBLEM-STATEMENT.md)                                                                                                                                                                                                  |
| Drivers / constraints              | [DECISION-DRIVERS.md](./DECISION-DRIVERS.md) · [CONSTRAINTS.md](./CONSTRAINTS.md)                                                                                                                                                               |
| Options / matrix                   | [OPTIONS-ANALYSIS.md](./OPTIONS-ANALYSIS.md) · [DECISION-MATRIX.md](./DECISION-MATRIX.md)                                                                                                                                                       |
| Architecture                       | [DURABLE-RUNTIME-ARCHITECTURE.md](./DURABLE-RUNTIME-ARCHITECTURE.md)                                                                                                                                                                            |
| Models                             | STATE / CLAIM / ATTEMPT / RETRY / DLQ / IDEMPOTENCY / ORDERING / RECOVERY / ADMIN / OBSERVABILITY                                                                                                                                               |
| Security / POPIA                   | [SECURITY-ASSESSMENT.md](./SECURITY-ASSESSMENT.md) · [POPIA-ASSESSMENT.md](./POPIA-ASSESSMENT.md)                                                                                                                                               |
| Data / events / realtime           | [DATA-MODEL.md](./DATA-MODEL.md) · [EVENT-MODEL.md](./EVENT-MODEL.md) · [REALTIME-INTEGRATION.md](./REALTIME-INTEGRATION.md)                                                                                                                    |
| Migration / host / capacity / FMEA | [MIGRATION-STRATEGY.md](./MIGRATION-STRATEGY.md) · [SHARED-HOST-ASSESSMENT.md](./SHARED-HOST-ASSESSMENT.md) · [CAPACITY-EVIDENCE-REQUIREMENTS.md](./CAPACITY-EVIDENCE-REQUIREMENTS.md) · [FAILURE-MODE-ANALYSIS.md](./FAILURE-MODE-ANALYSIS.md) |
| Compatibility / risks              | [COMPATIBILITY-ASSESSMENT.md](./COMPATIBILITY-ASSESSMENT.md) · [RISK-REGISTER.md](./RISK-REGISTER.md)                                                                                                                                           |
| Formal ADR                         | [ADR-0073.md](./ADR-0073.md)                                                                                                                                                                                                                    |
| Proposed ENG                       | [PROPOSED-ENGINEERING-PROGRAMME.md](./PROPOSED-ENGINEERING-PROGRAMME.md)                                                                                                                                                                        |
| Completion                         | [COMPLETION-REPORT.md](./COMPLETION-REPORT.md)                                                                                                                                                                                                  |
| Owner Acceptance                   | [OWNER-ACCEPTANCE.md](./OWNER-ACCEPTANCE.md)                                                                                                                                                                                                    |

## STOP

ADR **ACCEPTED**. Downstream design: [Platform-1.4-ENG-001A](../../engineering/platform-1.4-eng-001a/README.md) (**AWAITING OWNER DESIGN ACCEPTANCE**). Do **not** begin ENG-001B · ADR-0074 · ADR-0075 · implementation without named Approvals.
