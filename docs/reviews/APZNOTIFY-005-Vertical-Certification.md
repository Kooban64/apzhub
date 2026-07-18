# APZNOTIFY-005 — Vertical Certification

**Date:** 2026-07-16  
**Scope:** Platform Notification System of Record (metadata management plane)  
**Classification:** See [Production Readiness](./APZNOTIFY-005-Production-Readiness.md)

## Certified path

```text
Notification Workbench
→ createHttpNotificationClient() / notification-api
→ /api/v1/notifications/*
→ PlatformServiceGateway.notification.*
→ RequestPipeline
→ Production Authorization
→ Notification Platform Services
→ Notification Core
→ Notification Persistence
→ PostgreSQL
```

## Gates

| Gate                                        | Result                                     |
| ------------------------------------------- | ------------------------------------------ |
| `pnpm audit:notification-foundation`        | PASS                                       |
| `pnpm audit:notification-platform-services` | PASS                                       |
| `pnpm audit:notification-http-client`       | PASS                                       |
| `pnpm audit:notification-workbench`         | PASS                                       |
| `pnpm audit:notification-vertical`          | PASS (required)                            |
| `pnpm openapi:validate:platform`            | PASS                                       |
| Vitest `testing/notification-vertical`      | Required harness                           |
| Playwright live webServer                   | LIMITED (Testing slug conflict — external) |

## Intentional non-defects

No delivery providers, email, SMS, push, Teams, Slack, webhooks, Event Bus, workers, queues, scheduling, realtime, or AI notification generation.

## Architecture freeze

Notification metadata vertical frozen pending owner approval for **APZNOTIFY-006 — Notification Wave Certification & Architecture Freeze**.
