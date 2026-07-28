# n8n Integration — Compatibility Matrix

> **Programme:** APZHUB-INTEGRATION-N8N-001  
> **Package:** `@apzhub/integration-n8n` **0.1.0**

| Component                         | Version / range                  | Status                                                                             |
| --------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------- |
| `@apzhub/integration-sdk`         | **1.0.0**                        | Compatible · unchanged                                                             |
| n8n Public API                    | **v1**                           | Supported (read-only)                                                              |
| n8n engine                        | **1.0.0 – 1.x** (CE self-hosted) | Supported range (documented)                                                       |
| Workflow Information Model        | PLATFORM-WORKFLOW-002            | Metadata mapping aligned                                                           |
| `@apzhub/workflow-contracts`      | **0.4.0**                        | Evolved under APZHUB-PLATFORM-WORKFLOW-003 (post N8N-001); not modified by N8N-001 |
| OAuth                             | —                                | **Not implemented**                                                                |
| Execute / activate / webhook APIs | —                                | **Out of foundation scope**                                                        |

## Auth modes

| Mode                    | Status                                      |
| ----------------------- | ------------------------------------------- |
| `api_key`               | Supported                                   |
| `personal_access_token` | Supported (same header material as API key) |
| `basic`                 | Supported                                   |
| `oauth`                 | Placeholder only — rejected at connect      |

See [AUTHENTICATION.md](./AUTHENTICATION.md).
