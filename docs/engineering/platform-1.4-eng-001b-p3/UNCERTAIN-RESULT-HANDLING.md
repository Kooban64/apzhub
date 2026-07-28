# Uncertain Result Handling

When channel confirmation is unavailable (`simulateUncertainTimeout` / `UNCERTAIN_TIMEOUT`):

- Classified `transient_provider`
- Scheduled for retry when attempts remain
- Try note records `uncertain_provider_result`
- Platform does **not** claim exactly-once delivery
- Future provider_reference reconciliation is a documented limitation (no engine in P3)
