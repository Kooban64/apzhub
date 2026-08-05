# APZ Support — Product Operations

| Field     | Value            |
| --------- | ---------------- |
| Status    | **IN FORCE**     |
| Timestamp | 20260805T044500Z |

## Operating principle

APZ Support is operated as an APZHUB product. Quality is APZQEP. Identity is APZHUB. The engine is invisible.

## Cadence

| Cadence          | Artefact                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| Daily            | [APZSUPPORT-OPERATIONAL-READINESS.md](./APZSUPPORT-OPERATIONAL-READINESS.md) |
| Per change       | Engineering + Quality checklists                                             |
| Per release      | Release checklist + Operational Learning                                     |
| Weekly / Monthly | Operational Readiness reviews                                                |

## Roles (summary)

See [OPERATIONAL-ROLES.md](./OPERATIONAL-ROLES.md) for full RACI-style duties.

| Role                | Primary duty for APZ Support                   |
| ------------------- | ---------------------------------------------- |
| Developer           | Implement under Flow; no silent changes        |
| QA                  | Quality checklist; leakage / regression        |
| Product Owner       | Scope; refuse unauthorised expansion           |
| Engineering Manager | Flow health; evidence discipline               |
| Operations          | Production care; operational review            |
| Product Board       | Authorise programmes; accept material releases |

## Registers

| Register | Location                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------- |
| Friction | [../apzqep/apzqep-adopt-001/FRICTION-LOG.md](../apzqep/apzqep-adopt-001/FRICTION-LOG.md)                 |
| Learning | [OPERATIONAL-LEARNING.md](./OPERATIONAL-LEARNING.md) + ADOPT-001 Learning Register                       |
| Patterns | [../framework/APZHUB-EMERGING-PORTFOLIO-PATTERNS.md](../framework/APZHUB-EMERGING-PORTFOLIO-PATTERNS.md) |
| Metrics  | [OPERATIONAL-METRICS.md](./OPERATIONAL-METRICS.md)                                                       |

## Explicit non-ops

No new features, dashboards, analytics redesigns, notification subsystems, adapter enhancements, or APZQEP architecture work under this operations face.
