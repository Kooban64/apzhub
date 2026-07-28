# Metabase Integration — Operational Readiness

> **Programme:** APZHUB-INTEGRATION-METABASE-001  
> **Package:** `@apzhub/integration-metabase` **0.1.0**

## Readiness classification (adapter)

| Classification           | Meaning                                                    |
| ------------------------ | ---------------------------------------------------------- |
| `ready`                  | API reachable, auth valid, embedding enabled               |
| `ready_with_limitations` | Healthy/degraded with embedding disabled or partial probes |
| `not_ready`              | Unhealthy (auth missing/invalid or API unavailable)        |

Produced by `classifyMetabaseReadiness` / `adapter.diagnosticsExtension.readiness`.

## Operator checklist

1. Configure Metabase base URL and SecretProvider refs (`apiKeyRef` or session refs).
2. Initialise adapter via `createMetabaseAdapter`.
3. `connect` / `testConnection` — verify health + authenticated `/session/properties`.
4. Inspect diagnostics — confirm no secrets in logs/diagnostics payloads.
5. Confirm readiness before wiring future Analytics Platform Services.

## Not ready for

End-user Analytics product traffic · Workbench · HTTP gateway routes — require separate Owner Approval programmes.
