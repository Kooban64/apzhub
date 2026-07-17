# n8n Platform Services Error Mapping Guide

**APZWORKFLOW-007**

## Rules

1. Adapter / Integration SDK errors → `PlatformServiceError` via `mapProviderError` / `mapEngineError`.
2. `N8nNotSupportedError` → `PROVIDER_CAPABILITY_UNSUPPORTED` (`configuration`).
3. No REST status codes, Next.js responses, or provider exceptions on the gateway surface.
4. No stack traces or secret material in `message` / `details`.

## Classification examples

| Source | Platform code |
| --- | --- |
| NOT_SUPPORTED / mutations | `PROVIDER_CAPABILITY_UNSUPPORTED` |
| Integration auth failure | `UNAUTHENTICATED` / `FORBIDDEN` |
| Vendor unavailable | `INTEGRATION_UNAVAILABLE` |
| Not found | `NOT_FOUND` |
| Missing engine registration | `PROVIDER_CAPABILITY_UNSUPPORTED` |
