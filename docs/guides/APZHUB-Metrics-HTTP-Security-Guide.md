# APZHUB Metrics HTTP Security Guide

**Milestone:** APZMETRICS-003

## Principles

- Session authentication via `withPlatformApiAuth`
- Trusted `ServiceRequestContext` from session only
- Production Authorization via `metricsPlatformOps` (deny-by-default)
- Metadata responses only — never credentials, API keys, bearer tokens, DB URLs, or env secrets

## Unavailable service

When `APZHUB_METRICS_ENABLED` is false:

```json
{ "error": { "code": "METRICS_SERVICE_UNAVAILABLE", "message": "..." } }
```

HTTP status **503**. No silent in-memory production fallback.
