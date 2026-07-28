# n8n Integration — Known Limitations

> **Programme:** APZHUB-INTEGRATION-N8N-001  
> **Package:** `@apzhub/integration-n8n` **0.1.0**

| Limitation                                      | Notes                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| Read-only foundation                            | No execute, activate, create, update, delete, webhooks                 |
| OAuth not implemented                           | Use API key / PAT / basic                                              |
| Version probe variance                          | Some CE builds omit version headers; falls back to API capability hint |
| Edition-dependent endpoints                     | Users/projects/variables may return NOT_SUPPORTED                      |
| No Workflow Platform Services in this programme | Adapter only                                                           |
| Engine branding                                 | Must remain masked in product UI (consumer responsibility)             |
| Live adapter env-gated at platform layer        | `APZHUB_WORKFLOW_ENGINE_ENABLED` (platform bootstrap)                  |
| Secrets                                         | Never returned; credential metadata only                               |

## Honesty

**CERTIFIED_FOUNDATION** does not mean CERTIFIED_DOMAIN or commercial APZ Workflow GA.
