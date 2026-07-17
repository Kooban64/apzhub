# APZHUB Notification Platform Services Architecture

**Milestone:** APZNOTIFY-002 — Notification Platform Services, Gateway & Authorization  
**Status:** Authoritative for platform-services wiring  
**Packages:** `@apzhub/notification-contracts` **0.2.0** · `@apzhub/notification-core` **0.2.0** · `@apzhub/notification-persistence` **0.1.0** · `@apzhub/platform-services` **0.21.0**

---

## Request path

```text
Products
  → PlatformServiceGateway.notification.*
  → RequestPipeline
  → Production Authorization
  → Thin Platform Services
  → Notification Core (business rules)
  → Notification Persistence
  → PostgreSQL
```

No shortcuts. No delivery. No HTTP. No Workbench.

## Gateway facets

`gateway.notification.{notifications,templates,preferences,categories,channels,recipients,references,audit,diagnostics}`

## Bootstrap

- Factory: `createNotificationPlatformServicesForProduction({ postgresDb })`
- Test: `createNotificationPlatformServicesForTest({ allowInMemoryPersistence: true })`
- Env gate: `APZHUB_NOTIFICATION_ENABLED=true` (deny-by-default)
- App wire: `apps/web/lib/api/v1/gateway/bootstrap.ts`

## Explicit exclusions

Email / SMS / Push / Teams / Slack / Webhook delivery, queues, workers, Event Bus, HTTP, OpenAPI, typed client, Workbench, AI.
