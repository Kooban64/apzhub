# APZHUB Support HTTP API

**Milestone:** OSS-110-11  
**Status:** Canonical — HTTP surface for Support Platform Services  
**Base path:** `/api/v1/support-*`  
**Authority:** [Platform HTTP API](./APZHUB-Platform-HTTP-API.md) · [Support Platform Service Architecture](./APZHUB-Support-Platform-Service-Architecture.md) · [ADR-0051](../adr/ADR-0051-platform-http-api-surface.md) · OSS-110-10

---

## Purpose

Expose completed Support gateway contracts through the existing Platform HTTP API. Thin handlers only. No Support business logic. No Zammad identifiers in responses.

---

## Request path

```text
HTTP /api/v1/support-*
  → Zod validation (apps/web/lib/api/v1/schemas/support.ts)
  → withPlatformApiAuth (trusted session → ServiceRequestContext)
  → PlatformServiceGateway.support*
  → RequestPipeline + ProductionAuthorizationProvider
  → Support*ServiceImpl
  → MappingOrchestrator → Zammad providers → adapter.core
```

**Prohibited:** HTTP → Zammad adapter/provider/mapping store/DB; route-local permissions; inventing missing service ops.

---

## Canonical naming

| Public resource         | Meaning                                 | Global ID prefix |
| ----------------------- | --------------------------------------- | ---------------- |
| `support-requests`      | Support Request (not ticket/issue/task) | `sreq_`          |
| `support-organizations` | Support organisation                    | `sorg_`          |
| `support-groups`        | Support group / queue                   | `sgrp_`          |
| `support-users`         | Provider-domain Support user            | `suser_`         |
| nested `articles`       | Conversation article                    | `sart_`          |

Never expose `tickets`, `issues`, or Zammad provisional IDs (`*_zammad_*`).

---

## Routes

### Support requests

| Method | Path                                          | Gateway                                      |
| ------ | --------------------------------------------- | -------------------------------------------- |
| GET    | `/api/v1/support-requests`                    | `listSupportRequests`                        |
| POST   | `/api/v1/support-requests`                    | `createSupportRequest`                       |
| GET    | `/api/v1/support-requests/{supportRequestId}` | `getSupportRequest`                          |
| PATCH  | `/api/v1/support-requests/{supportRequestId}` | `updateSupportRequest`                       |
| DELETE | `/api/v1/support-requests/{supportRequestId}` | `closeSupportRequest` (soft close)           |
| POST   | `.../close`                                   | `closeSupportRequest`                        |
| POST   | `.../reopen`                                  | `reopenSupportRequest`                       |
| POST   | `.../state`                                   | `changeSupportRequestState`                  |
| POST   | `.../priority`                                | `changeSupportRequestPriority`               |
| POST   | `.../owner`                                   | `assignSupportRequest`                       |
| DELETE | `.../owner`                                   | `assignSupportRequest({ assigneeId: null })` |
| POST   | `.../customer`                                | `updateSupportRequest({ requesterId })`      |

### Articles

| Method | Path                       | Gateway                               |
| ------ | -------------------------- | ------------------------------------- |
| GET    | `.../articles`             | `supportArticles.list`                |
| GET    | `.../articles/{articleId}` | `supportArticles.get`                 |
| POST   | `.../articles/notes`       | `createNote` (always internal)        |
| POST   | `.../articles/replies`     | `createReply` (always public channel) |

No article update/delete. No binary attachment upload/download.

### Organisations / groups / users / search / history / analytics

| Method           | Path                                             | Gateway                        |
| ---------------- | ------------------------------------------------ | ------------------------------ |
| GET/POST         | `/api/v1/support-organizations`                  | list / create                  |
| GET/PATCH/DELETE | `/api/v1/support-organizations/{organizationId}` | get / update / archive         |
| GET/POST         | `/api/v1/support-groups`                         | list / create                  |
| GET/PATCH        | `/api/v1/support-groups/{groupId}`               | get / update                   |
| GET              | `/api/v1/support-users`                          | list / lookup / search (query) |
| GET              | `/api/v1/support-users/{userId}`                 | get                            |
| GET              | `/api/v1/support-search`                         | `supportSearch.search`         |
| GET              | `.../history`                                    | `supportHistory.getTimeline`   |
| GET              | `/api/v1/support-analytics`                      | `getSupportIntelligence`       |

---

## Intentionally excluded

- `/api/v1/support-sync`, `/api/v1/support-webhooks`, webhook ingress
- Binary attachments, article mutation beyond note/reply create
- Support UI / agent workspace
- Event Bus / notifications / WebSockets
- Platform identity administration via Support user routes

---

## Article visibility safety

- **Notes:** schema forbids visibility/channel overrides; gateway `createNote` always internal.
- **Replies:** separate route; channel limited to public channels (`email|phone|web|chat|sms|fax`); never `note`.

---

## Filters (support-requests list)

Strict Zod — unknown keys rejected. Canonical filters only: `status`, `priority`, `organizationId`, `groupId`, `ownerId`/`assigneeId`, `customerId`/`requesterId`, `search`, pagination/sort. No raw Zammad query syntax.

---

## Analytics caveat

`SupportIntelligenceSnapshot` may include derived/heuristic fields (e.g. overdue). These are **not** authoritative SLA measurements.

---

## Bootstrap

`ZAMMAD_INTEGRATION_ENABLED=true` registers Zammad providers via `createZammadAdapter` + `registerZammadProviders` in `apps/web/lib/api/v1/gateway/bootstrap.ts`. When disabled, Support routes fail with controlled `PROVIDER_CAPABILITY_UNSUPPORTED` / `501`.

---

## Related

- OpenAPI: [APZHUB-Platform-OpenAPI-v1.yaml](../specs/APZHUB-Platform-OpenAPI-v1.yaml)
- Completion: [OSS-110-11-completion-report.md](../sprint/OSS-110-11-completion-report.md)
