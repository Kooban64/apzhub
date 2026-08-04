# APZQEP-165-QO-004 — Enterprise Quality Flow Engine

| Field             | Value                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Programme         | APZQEP-165                                                                                               |
| Engineering Slice | **QO-004**                                                                                               |
| Legacy Slice      | S04                                                                                                      |
| Title             | Enterprise Quality Flow Engine                                                                           |
| Status            | **COMPLETE**                                                                                             |
| Package           | `@apzhub/platform-orchestration` **0.1.3**                                                               |
| Timestamp         | 20260804T085113Z                                                                                         |
| Evidence          | [evidence/apzqep-165-qo-004/20260804T085113Z/](../../../../evidence/apzqep-165-qo-004/20260804T085113Z/) |
| Next              | **QO-005** — Impact Correlation (separate Owner Auth)                                                    |

## Mission

Reusable Quality Flow Engine: immutable definitions, mutable instances, deterministic table-driven state machine, append-only history, recovery coordination. **Does not execute capabilities.**

## Documents

- [QUALITY-FLOW-DEFINITIONS.md](./QUALITY-FLOW-DEFINITIONS.md)
- [QUALITY-FLOW-INSTANCES.md](./QUALITY-FLOW-INSTANCES.md)
- [STATE-MACHINE.md](./STATE-MACHINE.md)
- [LIFECYCLE.md](./LIFECYCLE.md)
- [STATE-TRANSITIONS.md](./STATE-TRANSITIONS.md)
- [RECOVERY.md](./RECOVERY.md)
- [API.md](./API.md)
- [TESTING.md](./TESTING.md)
- [CERTIFICATION.md](./CERTIFICATION.md)
- [COMPLETION.md](./COMPLETION.md)
- [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)

## Core rules

1. Definitions are immutable; instances are mutable.
2. Instances pin a definition version.
3. Lifecycle is a deterministic, table-driven state machine.
4. Every transition is auditable; history is append-only.
5. Recovery resumes from the last valid recovery point.
6. Definitions never contain provider-specific behaviour.
7. The engine coordinates state — it never executes capabilities.
