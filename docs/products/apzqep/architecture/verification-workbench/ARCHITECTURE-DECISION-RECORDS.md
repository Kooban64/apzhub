# Architecture Decision Records — APZQEP-ARCH-010

ADRs become normative when this architecture is Owner-accepted. Full statements live in the authoritative specification §29.

| ID               | Title                                                              | Status   |
| ---------------- | ------------------------------------------------------------------ | -------- |
| ADR-ARCH-010-001 | Extend ARCH-006; do not fork the Workbench shell                   | Proposed |
| ADR-ARCH-010-002 | Queue-first / list-first / inspector-first                         | Proposed |
| ADR-ARCH-010-003 | Queues are presentation only                                       | Proposed |
| ADR-ARCH-010-004 | Server-authoritative availableActions                              | Proposed |
| ADR-ARCH-010-005 | Status and Outcome remain distinct in UX                           | Proposed |
| ADR-ARCH-010-006 | Future Evidence / Execution / Certification are presentation slots | Proposed |
| ADR-ARCH-010-007 | AI and MCP are consumers only                                      | Proposed |

See [VERIFICATION-WORKBENCH-ARCHITECTURE.md](./VERIFICATION-WORKBENCH-ARCHITECTURE.md#29-architecture-decisions-adrs).

## Inherited

| ID               | Title                                     | Relevance                                 |
| ---------------- | ----------------------------------------- | ----------------------------------------- |
| ADR-ARCH-006-001 | One Workbench grammar for all QEP modules | Directly applied                          |
| ADR-ARCH-006-004 | Server-authoritative available actions    | Affirmed by 010-004                       |
| ADR-ARCH-009-006 | Workbench reuses ARCH-006                 | Affirmed by 010-001                       |
| ADR-ARCH-008-002 | Matrix / list / inspector first           | Specialised: queue-first for Verification |
