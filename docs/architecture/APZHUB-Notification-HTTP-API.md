# APZHUB Notification HTTP API

**Milestone:** APZNOTIFY-003  
**Scope:** Management plane only — metadata and lifecycle via `/api/v1/notifications`

## Architecture

```text
Typed client → /api/v1/notifications/* → PlatformServiceGateway.notification.*
  → RequestPipeline → Production Authorization → thin Platform Services
  → Notification Core → Persistence → PostgreSQL
```

Handlers authenticate, build trusted `ServiceRequestContext`, validate inputs, call `gateway.notification.*`, and serialise API v1 envelopes. They never import Notification Core or persistence.

## Explicitly absent

No delivery, send/resend, providers, SMTP/SMS/push/Teams/Slack/webhooks, workers, queues, Event Bus, realtime, Workbench.

## Feature flag

`APZHUB_NOTIFICATION_ENABLED=true` — controlled `503 NOTIFICATION_SERVICE_UNAVAILABLE` when disabled.

## Related

- [Route Catalogue](../guides/APZHUB-Notification-Route-Catalogue.md)
- [Typed Client Architecture](./APZHUB-Notification-Typed-Client-Architecture.md)
- [OpenAPI Guide](../guides/APZHUB-Notification-OpenAPI-Guide.md)
- [Completion Report](../sprint/APZNOTIFY-003-completion-report.md)
