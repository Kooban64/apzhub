# OSS-110-12 Support API Certification

**Milestone:** OSS-110-12 — Support Vertical Slice Certification & Closeout  
**Date:** 2026-07-11  
**Status:** CERTIFIED_WITH_LIMITATIONS

---

## API endpoints certified

### Support Requests (14 endpoints)

| Method | Path                                             | Operation                    | Permission                    |
| ------ | ------------------------------------------------ | ---------------------------- | ----------------------------- |
| GET    | `/api/v1/support-requests`                       | listSupportRequests          | `support.requests.list`       |
| POST   | `/api/v1/support-requests`                       | createSupportRequest         | `support.requests.create`     |
| GET    | `/api/v1/support-requests/{id}`                  | getSupportRequest            | `support.requests.read`       |
| PATCH  | `/api/v1/support-requests/{id}`                  | updateSupportRequest         | `support.requests.update`     |
| DELETE | `/api/v1/support-requests/{id}`                  | closeSupportRequest          | `support.requests.transition` |
| POST   | `/api/v1/support-requests/{id}/close`            | closeSupportRequest          | `support.requests.transition` |
| POST   | `/api/v1/support-requests/{id}/reopen`           | reopenSupportRequest         | `support.requests.transition` |
| POST   | `/api/v1/support-requests/{id}/state`            | changeSupportRequestState    | `support.requests.transition` |
| POST   | `/api/v1/support-requests/{id}/priority`         | changeSupportRequestPriority | `support.requests.update`     |
| POST   | `/api/v1/support-requests/{id}/owner`            | assignSupportRequest         | `support.requests.assign`     |
| DELETE | `/api/v1/support-requests/{id}/owner`            | assignSupportRequest         | `support.requests.assign`     |
| POST   | `/api/v1/support-requests/{id}/customer`         | assignSupportRequest         | `support.requests.assign`     |
| GET    | `/api/v1/support-requests/{id}/history`          | getTimeline                  | `support.requests.read`       |
| GET    | `/api/v1/support-requests/{id}/articles`         | listArticles                 | `support.articles.list`       |
| POST   | `/api/v1/support-requests/{id}/articles/notes`   | createNote                   | `support.articles.create`     |
| POST   | `/api/v1/support-requests/{id}/articles/replies` | createReply                  | `support.articles.create`     |
| GET    | `/api/v1/support-requests/{id}/articles/{artId}` | getArticle                   | `support.articles.read`       |

### Organizations (3 endpoints)

| Method | Path                                 | Permission                      |
| ------ | ------------------------------------ | ------------------------------- |
| GET    | `/api/v1/support-organizations`      | `support.organizations.list`    |
| POST   | `/api/v1/support-organizations`      | `support.organizations.create`  |
| GET    | `/api/v1/support-organizations/{id}` | `support.organizations.read`    |
| PATCH  | `/api/v1/support-organizations/{id}` | `support.organizations.update`  |
| DELETE | `/api/v1/support-organizations/{id}` | `support.organizations.archive` |

### Groups (3 endpoints)

| Method | Path                          | Permission              |
| ------ | ----------------------------- | ----------------------- |
| GET    | `/api/v1/support-groups`      | `support.groups.list`   |
| POST   | `/api/v1/support-groups`      | `support.groups.create` |
| GET    | `/api/v1/support-groups/{id}` | `support.groups.read`   |
| PATCH  | `/api/v1/support-groups/{id}` | `support.groups.update` |

### Users (2 endpoints)

| Method | Path                         | Permission           |
| ------ | ---------------------------- | -------------------- |
| GET    | `/api/v1/support-users`      | `support.users.list` |
| GET    | `/api/v1/support-users/{id}` | `support.users.read` |

### Search & Analytics (2 endpoints)

| Method | Path                        | Permission               |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/v1/support-search`    | `support.search.execute` |
| GET    | `/api/v1/support-analytics` | `support.analytics.read` |

---

## Platform ID contract (certified)

| Entity          | Platform prefix   | Provider prefix (internal) |
| --------------- | ----------------- | -------------------------- |
| Support Request | `sreq_` + 32 hex  | `sreq_zammad_*`            |
| Organization    | `sorg_` + 32 hex  | `sorg_zammad_*`            |
| Group           | `sgrp_` + 32 hex  | `sgrp_zammad_*`            |
| User            | `suser_` + 32 hex | `suser_zammad_*`           |
| Article         | `sart_` + 32 hex  | `sart_zammad_*`            |

Provider-boundary IDs (`*_zammad_*`) are **never returned to HTTP clients**.

---

## Article visibility enforcement (certified)

| Endpoint                    | Forced visibility                       |
| --------------------------- | --------------------------------------- |
| `POST .../articles/notes`   | `internal` (regardless of request body) |
| `POST .../articles/replies` | `public` (regardless of request body)   |

---

## Boundary compliance

- ✅ HTTP layer: no `@apzhub/integration-zammad` imports
- ✅ HTTP layer: no `EntityMappingStore` imports
- ✅ HTTP layer: no direct database access
- ✅ HTTP layer: no Zammad REST types exposed to clients
- ✅ Service layer: no direct Zammad integration imports
- ✅ Provider layer: no Next.js or apps/web imports

---

## Known limitations

- No UI frontend
- No Event Bus publication
- No webhook ingress
- No binary attachments
- Durable idempotency deferred

See `docs/architecture/SUPPORT-VERTICAL-CERTIFICATION.md` for full limitations register.
