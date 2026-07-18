# APZHUB Disaster Recovery Overview (M8-06)

## Scope

Manual recovery guidance for self-hosted APZHUB. **No automation** in M8-06.

## System of record

| Data                   | Store              | Recovery                                         |
| ---------------------- | ------------------ | ------------------------------------------------ |
| Platform metadata      | PostgreSQL         | Restore from backup; replay migrations           |
| Sessions / rate limits | Redis              | Rebuild; users re-authenticate if needed         |
| Secrets                | Environment / host | Restore from secure vault                        |
| Business data          | Product engines    | Product-specific DR (out of Platform Core scope) |

## RTO / RPO (targets — not enforced)

| Tier          | RTO              | RPO                         |
| ------------- | ---------------- | --------------------------- |
| Platform Core | 4 hours (manual) | 24 hours (backup-dependent) |
| Product data  | Product-defined  | Product-defined             |

## Recovery sequence

1. Restore PostgreSQL and verify `checkDatabaseHealth()`.
2. Restore Redis and verify `checkRedisHealth()`.
3. Validate environment (`EnvironmentValidationService`).
4. Restart application; confirm `ensurePlatformRuntimeReady()`.
5. Run readiness probe; review Operations Console recovery guidance.

## Deferred

Multi-region failover, automated backup orchestration, cloud DR services.
