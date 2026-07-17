# APZNOTIFY-006 — Programme Summary

**Programme:** APZHUB Platform Notification System of Record  
**Closeout:** APZNOTIFY-006 (2026-07-16)  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS** (frozen)

---

## Wave milestones

1. **001** — Platform Notification Foundation (contracts, core, persistence)  
2. **002** — Platform Services, Gateway & Authorization (`gateway.notification.*`)  
3. **003** — HTTP API & Production Typed Client (`/api/v1/notifications`, OpenAPI 1.4.0)  
4. **004** — Notification Workbench (`/workspace/notifications`)  
5. **005** — Vertical Certification → **PRODUCTION_READY_WITH_LIMITATIONS**  
6. **006** — Wave Certification & Architecture Freeze → **frozen**

## Certified stack

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

## What was never delivered (by design)

Email · SMTP · SES · SMS · push · Teams · Slack · webhooks · delivery providers · workers · queues · scheduling · Event Bus · realtime · AI generation · template designer

## Official freeze

See [Architecture Freeze Notice](../architecture/APZHUB-Notification-Architecture-Freeze-Notice.md).

## Roadmap only (not authorised)

**APZNOTIFY-007 — Notification Delivery Provider Framework (SMTP, SES, SMS, Push, Teams, Slack, Webhooks)** — see [Future Delivery Framework Guide](../developer/APZHUB-Notification-Future-Delivery-Framework-Guide.md).
