# Workflow Engine HTTP Security Guide

**APZWORKFLOW-008**

- Session auth via `withPlatformApiAuth`
- Authorization via RequestPipeline + Production Authorization (`workflow.engine.*`)
- Metadata responses only — never API keys, tokens, credentials, secrets, webhook values, runtime variables, or execution payloads
- Diagnostics/authMode may state mode names (e.g. `api_key`) but never secret material
- Controlled `503 WORKFLOW_SERVICE_UNAVAILABLE` when Workflow Platform disabled
- Adapter unavailable → platform `PROVIDER_CAPABILITY_UNSUPPORTED` (HTTP 501)
