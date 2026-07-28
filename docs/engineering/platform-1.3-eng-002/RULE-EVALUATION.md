# Rule Evaluation

`ObserveAlertEvaluationService.evaluateBatch` / domain `createObserveAlertEvaluationDomain`.

1. Gate on `APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED`
2. Load active definitions with `metadata.rule.enabled`
3. Load signal via Observe repos (serviceHealth, componentStatuses, …)
4. Evaluate predicate (`status_in` / `status_not_in` / `threshold`)
5. Dedup by fingerprint; suppress; transition; publish events

No PromQL. No provider SDKs in Platform Services.
