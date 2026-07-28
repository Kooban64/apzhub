# n8n Integration — Authentication

> **Programme:** APZHUB-INTEGRATION-N8N-001  
> **Package:** `@apzhub/integration-n8n` **0.1.0**

---

## Supported methods

| Mode                      | Wire format              | Secret refs                             | Status                                 |
| ------------------------- | ------------------------ | --------------------------------------- | -------------------------------------- |
| **api_key**               | `X-N8N-API-KEY`          | `apiKeyRef`                             | **Supported**                          |
| **personal_access_token** | `X-N8N-API-KEY`          | `personalAccessTokenRef`                | **Supported**                          |
| **basic**                 | `Authorization: Basic …` | `basicUsernameRef` + `basicPasswordRef` | **Supported**                          |
| **oauth**                 | —                        | Placeholder only                        | **Not implemented** — connect rejected |

## Deployment model

Self-hosted **n8n CE** with Public API v1 enabled. Secrets resolved through Integration SDK `SecretProvider` — never logged, never returned from diagnostics.

## Limitations

1. OAuth / OIDC login flows are out of foundation scope.
2. Session-cookie browser auth is not used (server-to-server only).
3. Credential **values** inside n8n credential stores are never fetched — metadata listing only.
4. Rotate keys via secret store; update refs without code changes.
