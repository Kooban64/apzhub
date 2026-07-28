# Observability

Baseline commands emit structured `onObservation` events with:

- operation name (`createBaseline`, `lockBaseline`, `archiveBaseline`,
  membership ops, `compareBaselines`, `verifyBaselineIntegrity`, …)
- duration in milliseconds
- outcome (`success` | `error`)

Correlation identifiers flow through the Platform request pipeline. Audit
actions provide the authoritative trail. Sensitive Requirement snapshot content
and secrets are not logged.
