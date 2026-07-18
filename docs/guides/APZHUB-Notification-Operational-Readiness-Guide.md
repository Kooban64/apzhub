# APZHUB Notification — Operational Readiness Guide

**Milestone:** APZNOTIFY-006  
**Classification:** **PRODUCTION_READY_WITH_LIMITATIONS**  
**Audience:** Operators, platform engineers

---

## Supported capabilities

- Notification metadata SoR: create/read/update lifecycle (draft → pending → read / acknowledged / dismissed / archived / …)
- Templates, preferences, categories, channels (metadata / capability flags only)
- Recipients and cross-product references (metadata; address hints only)
- Audit timeline
- Capabilities / health / readiness / diagnostics
- Workbench at `/workspace/notifications` (typed-client presentation only)
- Typed client + OpenAPI **Platform Notifications** tag
- Production Authorization (`notification.*`) via RequestPipeline

## Intentionally unsupported

- Email / SMTP / SES
- SMS
- Push
- Teams / Slack / Webhooks
- Delivery providers of any kind
- Workers / queues / scheduling
- Event Bus publication from Notification plane
- Realtime inbox polling / WebSocket / SSE
- AI / automatic notification generation
- Template designer

**DELIVERY PROVIDERS NOT AVAILABLE** — Workbench and diagnostics must continue to surface this.

## Known limitations

- Metadata management plane only
- Playwright live webServer may be LIMITED by unrelated Testing slug conflict
- Live PostgreSQL optional in unit CI (in-memory parity for tests)
- `notification.delivery` permission reserved / unwired

## Security posture

- Auth required on every Notification HTTP route
- Authz via Production Authorization (no allow-all)
- No provider secrets or delivery credentials in repo / UI / client
- Recipient privacy: no address editing; hints only
- Server remains authoritative for permissions

## Production deployment expectations

1. Deploy platform PostgreSQL with Notification migrations (0046/0047 family as shipped)
2. Enable Notification platform services wiring (`APZHUB_NOTIFICATION_ENABLED` as documented in bootstrap guides)
3. Grant `notification.*` permissions per role catalogue
4. Operate Workbench / HTTP for metadata management only
5. Do **not** configure SMTP/SMS/push — no providers exist

## Configuration requirements

| Area         | Expectation                                                     |
| ------------ | --------------------------------------------------------------- |
| PostgreSQL   | Platform DB with Notification tables                            |
| Redis        | Platform session/cache as elsewhere (not Notification delivery) |
| Feature flag | Notification services enabled per environment docs              |
| Secrets      | None for delivery (providers absent)                            |

## Maintenance expectations

- Re-run `pnpm audit:notification-vertical` and `pnpm audit:notification-wave` on regressions
- Do not change frozen architecture without ADR + owner approval
- Future delivery follows [Future Delivery Framework Guide](../developer/APZHUB-Notification-Future-Delivery-Framework-Guide.md) under **APZNOTIFY-007** (roadmap only)
