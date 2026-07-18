# OSS-102 — Zammad / Support Integration Backlog

> **Purpose:** Phased engineering backlog for Wave 2 Support (Zammad)  
> **Audience:** Engineers, owners, AI agents  
> **Authoritative references:** [ZAMMAD-IMPLEMENTATION-PLAN](../architecture/ZAMMAD-IMPLEMENTATION-PLAN.md) · [REFERENCE-ADAPTER-STANDARD](../architecture/REFERENCE-ADAPTER-STANDARD.md) · [OSS-102-01 Completion Report](../sprint/OSS-102-01-completion-report.md)  
> **Last updated:** 2026-07-10

---

## Gates

| Gate                          | Required before           |
| ----------------------------- | ------------------------- |
| Wave 1 complete (OSS-101-10)  | OSS-102-01                |
| Owner approval                | Each phase                |
| Reference Adapter Standard    | All implementation phases |
| OSS-102-01 discovery complete | OSS-102-02                |

---

## Phase overview

| #   | ID         | Title                                         | Status                                         |
| --- | ---------- | --------------------------------------------- | ---------------------------------------------- |
| 1   | OSS-102-01 | Discovery & architecture                      | **Complete**                                   |
| 2   | OSS-102-02 | Integration foundation (adapter scaffold)     | **Complete**                                   |
| 3   | OSS-102-03 | Core Support services (`adapter.core`)        | **Complete**                                   |
| 4   | OSS-102-04 | Articles, conversations & attachment metadata | **Complete**                                   |
| 5   | OSS-102-05 | Search, history & support intelligence        | **Complete**                                   |
| 6   | OSS-102-06 | Synchronisation, events & webhooks            | **Complete**                                   |
| 7   | OSS-102-07 | Operations, diagnostics & certification       | **Complete**                                   |
| 8   | OSS-102-08 | Wave 2 certification & closeout               | **Complete**                                   |
| 9   | OSS-102-09 | _(Reserved — owner sequencing)_               | Planned                                        |
| —   | OSS-110-10 | Support PlatformService contracts / providers | **Complete**                                   |
| —   | OSS-110-11 | Support HTTP API Surface                      | **Complete**                                   |
| —   | OSS-110-12 | Support Vertical-Slice Certification          | **Complete** — CERTIFIED_WITH_LIMITATIONS      |
| —   | OSS-110-13 | Support Module UI                             | **Complete** — UI delivered; cert → OSS-110-14 |
| —   | OSS-110-14 | Support Module UI Certification               | **Await approval**                             |

---

## OSS-102-01 — Discovery & architecture

**Objective:** Understand Zammad completely; produce docs so implementation follows the Reference Adapter Standard without redesign.

**Deliverables:** Architecture, mapping, capability matrix, implementation plan, test plan, completion report, foundation updates.

**Out of scope:** All production code, SDK/Platform/HTTP/UI/tests/clients.

**Stop condition:** ✅ Complete — await owner approval before OSS-102-02.

---

## OSS-102-02 — Zammad Integration Foundation

**Objective:** Create `@apzhub/integration-zammad` foundation per Reference Adapter Standard (owner-approved scope supersedes earlier “ADRs only” title).

**Deliverables:**

- Package, `integration.yaml`, factory, bootstrap, config (incl. OAuth placeholder)
- `ZammadAdapter` lifecycle, diagnostics, version/edition detection
- `ZammadFetchClient` / `ZammadRestClient` connection foundation
- `ZammadVendorErrorMapper`, placeholder capabilities, mock tests
- [ZAMMAD-ADAPTER.md](../../integrations/zammad/docs/ZAMMAD-ADAPTER.md)
- [OSS-102-02 Completion Report](../sprint/OSS-102-02-completion-report.md)

**Out of scope:** Ticket/article/org services, PlatformService, HTTP, UI, OAuth implementation.

**Stop condition:** ✅ Complete — proceeded to OSS-102-03 after owner approval.

---

## OSS-102-03 — Zammad Core Support Services

**Objective (owner scope):** Implement core Support-domain services on `adapter.core` (support, organizations, groups, users) following the Plane Reference Adapter pattern.

**Delivered:**

- `ZammadCoreServices` + `ZammadOperationRunner`
- Extended `ZammadRestClient` (tickets/orgs/groups/users)
- Canonical Support DTOs in `@apzhub/platform-service-contracts` v0.3.0
- Capability registration, diagnostics, mock API, contract tests
- [OSS-102-03 Completion Report](../sprint/OSS-102-03-completion-report.md)

**Out of scope:** PlatformService, HTTP, UI, articles, sync, webhooks, OAuth, platform identity.

**Stop condition:** ✅ Complete — await owner approval before OSS-102-04.

---

## OSS-102-04 — Articles, conversations & attachment metadata

**Objective (owner scope):** Implement Support conversation articles on `adapter.core.articles` with attachment metadata only.

**Delivered:**

- `ZammadArticleService` (list/get/createNote/createReply/create)
- Canonical `SupportArticle*` DTOs in contracts v0.4.0
- Mock API, diagnostics, capability promotion
- [ZAMMAD-ARTICLES.md](../../integrations/zammad/docs/ZAMMAD-ARTICLES.md)
- [OSS-102-04 Completion Report](../sprint/OSS-102-04-completion-report.md)

**Out of scope:** Binary attachments, PlatformService, HTTP, UI, sync, webhooks.

**Stop condition:** ✅ Complete — await owner approval before OSS-102-05.

---

## OSS-102-05 — Search, history & support intelligence

**Status:** ✅ Complete — `@apzhub/integration-zammad` **v0.4.0**

**Delivered:**

- `adapter.core.search` / `history` / `analytics`
- Canonical Support search, history timeline, and intelligence DTOs (`platform-service-contracts` v0.5.0)
- Mock API, diagnostics, capability promotion
- [ZAMMAD-SEARCH.md](../../integrations/zammad/docs/ZAMMAD-SEARCH.md) · [ZAMMAD-HISTORY.md](../../integrations/zammad/docs/ZAMMAD-HISTORY.md) · [ZAMMAD-ANALYTICS.md](../../integrations/zammad/docs/ZAMMAD-ANALYTICS.md)
- [OSS-102-05 Completion Report](../sprint/OSS-102-05-completion-report.md)

**Out of scope:** PlatformService, HTTP, UI, sync, webhooks, Event Bus, notifications, binary attachments, SLA engine.

**Stop condition:** ✅ Complete — await owner approval before OSS-102-06.

---

## OSS-102-06 — Synchronisation, events & webhooks

**Status:** ✅ Complete — `@apzhub/integration-zammad` **v0.5.0**

**Delivered:**

- `adapter.core.synchronisation` / `events` / `webhooks`
- Canonical Support event types (contracts v0.6.0)
- Mock API, diagnostics, metrics, error translation, capability promotion
- [ZAMMAD-SYNC.md](../../integrations/zammad/docs/ZAMMAD-SYNC.md) · [ZAMMAD-EVENTS.md](../../integrations/zammad/docs/ZAMMAD-EVENTS.md) · [ZAMMAD-WEBHOOKS.md](../../integrations/zammad/docs/ZAMMAD-WEBHOOKS.md)
- [OSS-102-06 Completion Report](../sprint/OSS-102-06-completion-report.md)

**Out of scope:** PlatformService, HTTP, UI, Platform Event Bus, webhook ingress, workers, schedulers, persistence.

**Stop condition:** ✅ Complete — await owner approval before OSS-102-07.

---

## OSS-102-07 … OSS-102-10

See [ZAMMAD-IMPLEMENTATION-PLAN.md](../architecture/ZAMMAD-IMPLEMENTATION-PLAN.md) for detailed scope. Each phase requires owner approval and must stop at its boundary.

---

## Explicit programme exclusions (until separately approved)

- Support Workbench UI
- `/api/v1/support` HTTP (unless approved as parallel track)
- Webhook HTTP ingress
- Platform Event Bus
- GraphQL
- Enterprise-only features
- Plane/Projects changes

---

## Related

- [ACTIVE-BACKLOG](../foundation/ACTIVE-BACKLOG.md)
- [OSS Wave Roadmap](../strategy/APZHUB-OSS-Wave-Roadmap.md)
