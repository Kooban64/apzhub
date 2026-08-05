# APZ Time — Product Operations

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T034500Z |

## Operating principle

APZ Time is operated as an APZHUB product. Quality is APZQEP. Identity is APZHUB. The engine is invisible.

## Cadence

| Cadence          | Artefact                                                               |
| ---------------- | ---------------------------------------------------------------------- |
| Daily            | [APZTIME-OPERATIONAL-READINESS.md](./APZTIME-OPERATIONAL-READINESS.md) |
| Per change       | Engineering + Quality checklists                                       |
| Per release      | Release checklist + Operational Learning                               |
| Weekly / Monthly | Operational Readiness reviews                                          |

## Roles (summary)

See [OPERATIONAL-ROLES.md](./OPERATIONAL-ROLES.md) for full RACI-style duties.

| Role                | Primary duty for APZ Time                      |
| ------------------- | ---------------------------------------------- |
| Developer           | Implement under Flow; no silent changes        |
| QA                  | Quality checklist; leakage / regression        |
| Product Owner       | Scope; refuse unauthorised expansion           |
| Engineering Manager | Flow health; evidence discipline               |
| Operations          | Health / readiness; production care            |
| Product Board       | Authorise programmes; accept material releases |

## Registers

| Register | Location                                                                                 |
| -------- | ---------------------------------------------------------------------------------------- |
| Friction | [../apzqep/apzqep-adopt-001/FRICTION-LOG.md](../apzqep/apzqep-adopt-001/FRICTION-LOG.md) |
| Learning | [OPERATIONAL-LEARNING.md](./OPERATIONAL-LEARNING.md) + ADOPT-001 Learning Register       |
| Metrics  | [OPERATIONAL-METRICS.md](./OPERATIONAL-METRICS.md)                                       |

## Explicit non-ops

No new features, dashboards, analytics, notifications, billing, leave, scheduling, AI, workflow, adapter enhancements, or APZQEP architecture work under this operations face.
