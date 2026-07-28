# Failure-Mode Analysis

| Mode                       | Detection         | Authoritative state | Recovery               | Duplicate risk | Data-loss risk    | Ops action       | Audit     | Residual |
| -------------------------- | ----------------- | ------------------- | ---------------------- | -------------- | ----------------- | ---------------- | --------- | -------- |
| DB unavailable             | health fail       | last committed      | pause claim; back off  | low            | intake reject     | alert            | yes       | medium   |
| Event Bus down             | publish fail-soft | DB                  | retry publish async    | low            | none for delivery | alert            | partial   | low      |
| Outbox delayed             | lag metrics       | DB                  | N/A if not claim path  | low            | none              | monitor          | —         | low      |
| Worker crash pre-dispatch  | lease expiry      | processing→reclaim  | reclaim                | low            | none              | auto             | lease log | low      |
| Worker crash post-dispatch | ambiguous try     | try+provider_ref    | reconcile              | medium         | low               | runbook          | yes       | medium   |
| Provider timeout           | try fail class    | retry/permanent     | policy                 | medium         | low               | alert            | yes       | medium   |
| Provider duplicate accept  | provider_ref      | delivered           | ignore dup             | controlled     | none              | —                | yes       | low      |
| Provider outage            | fail rate         | retry_scheduled     | backoff                | low            | delayed           | status page      | yes       | medium   |
| Poison message             | permanent_failure | DLQ                 | manual                 | low            | none              | triage           | yes       | low      |
| Retry storm                | metrics           | capped attempts     | circuit/max            | low            | none              | tune             | yes       | medium   |
| Stale lease                | reclaim job       | queued              | reclaim                | low            | none              | auto             | yes       | low      |
| Admin replay error         | audit             | new attempts        | cancel                 | medium         | low               | privilege review | yes       | low      |
| Clock skew                 | lease anomalies   | leases              | NTP; widen skew budget | medium         | low               | ops              | —         | low      |
| Partial migration          | dual mode flags   | flag SoR            | halt cutover           | medium         | medium            | rollback flag    | yes       | medium   |
| DB growth                  | size metrics      | —                   | retention              | —              | —                 | purge policy     | —         | medium   |
| Tenant/org suspension      | authz             | suppress/cancel     | stop claim             | low            | none              | policy           | yes       | low      |
