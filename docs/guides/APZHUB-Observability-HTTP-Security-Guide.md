# Observability HTTP Security Guide

**Milestone:** APZOBSERVE-003

## Authentication & authorization

- Every App Router route uses `withPlatformApiAuth`.
- Handlers build a trusted `ServiceRequestContext` (never trust client roles/permissions).
- Authorization is enforced in RequestPipeline via `observePlatformOps` / `PLATFORM_OBSERVE_PERMISSIONS` (deny-by-default).

## Enablement

`APZHUB_OBSERVE_ENABLED=false` (default) → HTTP returns `503 OBSERVE_SERVICE_UNAVAILABLE`. No silent fallback.

## Data exposure

Responses return **canonical observability metadata only**.

**Never expose:**

- Grafana / Prometheus / Loki / AlertManager credentials
- API keys, bearer tokens, webhook secrets
- Connection strings or internal provider configuration
- Scraped metric series, log lines, or live trace payloads

Diagnostics describe platform readiness, persistence readiness, metadata completeness, and registration state — they do **not** probe external providers.

## Transport boundaries

Handlers must not import observe-core, observe-persistence, repositories, or PostgreSQL clients.
