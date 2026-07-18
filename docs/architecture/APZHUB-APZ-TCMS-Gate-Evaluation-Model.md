# APZ TCMS — Gate Evaluation Model

**Milestone:** APZTCMS-009

---

## Gate outcomes

| Status           | Meaning                         |
| ---------------- | ------------------------------- |
| `pass`           | Gate satisfied                  |
| `fail`           | Gate not satisfied              |
| `warning`        | Soft failure / attention needed |
| `not_applicable` | Gate does not apply             |
| `unknown`        | Insufficient data to evaluate   |

---

## Built-in gate keys (configurable)

execution_complete, coverage_threshold, evidence_complete, manual_testing_complete, automation_complete, approvals_complete, no_critical_defects, risk_accepted, compliance_complete, documentation_complete (+ custom).

---

## Evaluation result shape

Every evaluation returns:

- `status`
- `reason` (human-readable)
- `supportingEvidence` (refs / metrics)
- `evaluatedAt`
- `evaluatorUserId`
- `traceability` refs

No hidden calculations — deterministic and explainable.

Persisted on `testing_certification_gate_evaluation`. Rules on `testing_certification_rule` / definitions on `testing_certification_gate_definition`.
