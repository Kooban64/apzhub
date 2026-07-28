# n8n Integration — Operational Readiness

> **Programme:** APZHUB-INTEGRATION-N8N-001  
> **Package:** `@apzhub/integration-n8n` **0.1.0**

## Configuration (adapter)

| Field        | Notes                                                                 |
| ------------ | --------------------------------------------------------------------- |
| `baseUrl`    | n8n instance origin (healthz probe)                                   |
| `apiBaseUrl` | Typically `{baseUrl}/api/v1`                                          |
| `authMode`   | `api_key` \| `personal_access_token` \| `basic`                       |
| Secret refs  | Via SecretProvider — never inline secrets in config committed to repo |

## Platform enablement (consumer)

| Flag                             | Role                                                        |
| -------------------------------- | ----------------------------------------------------------- |
| `APZHUB_WORKFLOW_ENGINE_ENABLED` | Env-gates live engine path in platform bootstrap (existing) |

## Health & diagnostics

- Adapter `health()` / `diagnostics()` — no secrets in payloads
- Version tag surfaced on diagnostics when detected
- Circuit breaker on repeated failures

## Ops notes

1. Prefer API key with least privilege for read-only Public API.
2. Do not expose n8n admin UI as primary APZHUB UX.
3. Monitor latency via adapter metrics (`connection_test` operations).
4. Edition differences may disable users/projects/variables discovery.
