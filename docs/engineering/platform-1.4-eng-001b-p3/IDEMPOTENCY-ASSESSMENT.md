# Idempotency Assessment

| Scenario                | Control                                  |
| ----------------------- | ---------------------------------------- |
| Duplicate claim         | SKIP LOCKED / ownership                  |
| Duplicate completion    | Fencing rejects non-owner                |
| Repeated tick           | Terminal / non-processing skipped        |
| Attempt start duplicate | Unique (delivery_id, attempt_number)     |
| Event republish         | Fail-soft; DB remains SoR                |
| Uncertain timeout       | Retryable; may duplicate external effect |

**Not claimed:** exactly-once external delivery.
