# Certification Readiness Recommendation — APZQEP-ECR-001

## Recommendation

```text
READY_WITH_LIMITATIONS
```

## Interpretation

The Owner **may** authorise a Certification programme for Test Execution. Certification **must not** assume the following are already production-complete:

| Limitation                                        | Why it matters for Certification                              |
| ------------------------------------------------- | ------------------------------------------------------------- |
| OpenAPI not published (TD-01)                     | Consumer/contract certification incomplete                    |
| EvidenceAccessPort default-allow (TD-03 / SEC-01) | Access control certification incomplete                       |
| Outbox enqueue-only (TD-02)                       | Eventual consistency / notify/search certification incomplete |
| No Postgres integration tests (TD-04)             | Persistence certification confidence reduced                  |

## Preconditions recommended before Certification start

Owner chooses one for each High item:

1. **Remediate** under a short Owner-authorised prep programme, or
2. **Formally accept** as Certification scope exclusion / known limitation with residual risk.

## Explicitly not recommended yet

- Production Freeze
- Release
- Declaring the capability production-certified without addressing or accepting High limitations

## Mandatory stop

This recommendation does **not** authorise Certification. Certification requires a separate Owner Engineering Directive.
