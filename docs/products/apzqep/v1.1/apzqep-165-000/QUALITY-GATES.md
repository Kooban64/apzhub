# QUALITY-GATES — APZQEP-165-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-165-000   |
| Timestamp | 20260804T054651Z |

## Principle

Gates are **composed policies** evaluated by orchestration using inputs referenced from registered capabilities. Gate thresholds and domain calculations remain owned by the capability that produces the signal (e.g. QI owns scores).

## Gate catalogue (architecture support)

| Gate ID                  | Input owner             | Orchestration role                |
| ------------------------ | ----------------------- | --------------------------------- |
| `evidence.completeness`  | Evidence                | Require declared evidence set     |
| `automation.completion`  | Automation              | Require successful completion     |
| `qi.quality_score`       | QI                      | Compare score to policy threshold |
| `qi.coverage`            | QI / Automation metrics | Threshold check                   |
| `defects.open`           | Defect/project refs     | Threshold / severity policy       |
| `requirements.coverage`  | Requirements refs       | Completeness policy               |
| `scm.repository_health`  | SCM                     | Health signal check               |
| `ops.operational_health` | Observability / health  | Platform health check             |
| `compliance.pack`        | Compliance capability   | Required pack pass                |
| `human.approval`         | Approval coordinator    | Required approval state           |

Future capabilities register additional gate input types; orchestration composes them without redesign.

## Gate composition

```text
GatePolicy {
  policyId, version
  mode: all_of | any_of | weighted (future)
  gates: [ { gateId, severity: blocking|warning, params } ]
  onWarning: continue|hold
  onBlockingFail: fail|await_waiver|await_approval
}
```

## Overrides & waivers

- Overrides require explicit permission (`orchestration.gate.waive` or equivalent)
- Waiver records: who, when, why, scope, expiry, correlation ids, gate snapshot
- Waivers are **immutable** audit facts; they do not delete failed gate evidence
- Superadmin is **not** a silent bypass — same audited waiver path

## Advisory vs blocking

QI outputs marked advisory never alone produce GO. Blocking gates are explicit in policy.

## Non-goals

- Implementing threshold engines in UI
- Dashboards owning gate pass/fail mutation
- Autonomous production GO via gate pass alone without approval policy
