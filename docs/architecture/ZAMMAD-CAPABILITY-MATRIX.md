# Zammad Capability Matrix

> **Purpose:** Classify Zammad capabilities for APZHUB Support Wave 2  
> **Audience:** Engineers, owners, AI agents  
> **Authoritative references:** [ZAMMAD-ARCHITECTURE](./ZAMMAD-ARCHITECTURE.md) · [ZAMMAD-MAPPING](./ZAMMAD-MAPPING.md) · [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md)  
> **Status:** Discovery  
> **Last updated:** 2026-07-10  
> **Milestone:** OSS-102-01

---

## Legend

| Category            | Meaning                                                           |
| ------------------- | ----------------------------------------------------------------- |
| **Core**            | Required for Wave 2 MVP Support                                   |
| **Optional**        | Implement if CE exposes stably; degrade without failing readiness |
| **Enterprise-only** | Avoid — not required; document if hosted-only marketing           |
| **Unsupported**     | Out of scope permanently or until ADR                             |
| **Future**          | Planned after Wave 2 core                                         |

---

## Capability catalogue

| Capability ID                | Zammad surface                      | Category        | Min CE (planned) | Dependencies       | Notes                            |
| ---------------------------- | ----------------------------------- | --------------- | ---------------- | ------------------ | -------------------------------- |
| `health`                     | Connectivity + `/users/me`          | Core            | 6.3.x*           | Auth               | SDK health provider              |
| `authentication`             | Token / OAuth / Basic               | Core            | 6.3.x*           | Secrets            | Token preferred                  |
| `users`                      | `/api/v1/users`                     | Core            | 6.3.x*           | Auth               | Map to platform users            |
| `organizations`              | `/api/v1/organizations`             | Core            | 6.3.x*           | Users              | Organisation SoR in Zammad       |
| `groups`                     | `/api/v1/groups`                    | Core            | 6.3.x*           | Auth               | Support teams / queues           |
| `roles`                      | `/api/v1/roles`                     | Optional        | 6.3.x*           | Users              | Translation only; no UI          |
| `tickets`                    | `/api/v1/tickets`                   | Core            | 6.3.x*           | Groups, users      | Support Requests                 |
| `articles`                   | `/api/v1/ticket_articles`           | Core            | 6.3.x*           | Tickets            | Comments / notes                 |
| `attachments`                | ticket_attachment + article payload | Core            | 6.3.x*           | Articles           | Size limits in service           |
| `tags`                       | `/api/v1/tags*`                     | Core            | 6.3.x*           | Tickets            | Support tags                     |
| `ticket_states`              | `/api/v1/ticket_states`             | Core            | 6.3.x*           | —                  | Read catalogue; map status       |
| `ticket_priorities`          | `/api/v1/ticket_priorities`         | Core            | 6.3.x*           | —                  | Map priority enum                |
| `search`                     | `/tickets/search` etc.              | Optional        | 6.3.x* + ES      | Tickets            | Prefer platform search long-term |
| `history`                    | Ticket history                      | Optional        | 6.3.x*           | Tickets            | → Activity                       |
| `overviews`                  | `/api/v1/overviews`                 | Future          | 6.3.x*           | Tickets            | Native filters preferred         |
| `sla`                        | SLA + calendars                     | Optional        | 6.3.x*           | Tickets, calendars | Read breach signals              |
| `calendars`                  | `/api/v1/calendars`                 | Optional        | 6.3.x*           | SLA                | Business hours                   |
| `triggers`                   | Admin triggers                      | Future          | 6.3.x*           | —                  | Engine-owned authoring           |
| `macros`                     | Macros                              | Future          | 6.3.x*           | Tickets            | Optional execute                 |
| `webhooks`                   | Outbound webhooks                   | Optional        | 6.3.x*           | Auth               | Translate; ingress later         |
| `events`                     | Translator + sync                   | Core            | —                | Webhooks/sync      | Adapter-local                    |
| `synchronisation`            | Full/incremental sync               | Core            | —                | Tickets, mapping   | Cursor-based                     |
| `diagnostics`                | SDK + ops reports                   | Core            | —                | Health             | No secrets                       |
| `compatibility`              | Version matrix                      | Core            | —                | Version probe      | Pin CE range                     |
| `readiness`                  | Structured checks                   | Core            | —                | Config, auth       | Required vs optional             |
| `analytics`                  | Counts / SLA stats                  | Optional        | 6.3.x*           | Tickets            | Degraded if unavailable          |
| `knowledge_base`             | KB API                              | Future          | 6.3.x*           | —                  | Help articles                    |
| `channels_social`            | Twitter/FB/Telegram                 | Unsupported     | —                | —                  | Not Wave 2                       |
| `cti_chat_live`              | CTI / live chat                     | Future          | —                | —                  |                                  |
| `graphql`                    | —                                   | Unsupported     | —                | —                  | No first-party GraphQL           |
| `ee_branding_multi_instance` | Hosted EE packaging                 | Enterprise-only | —                | —                  | Not required                     |

\*Exact version pin confirmed in OSS-102-02 against inventory.

---

## Implementation status (OSS-102-06)

| Capability                         | Adapter status                                      |
| ---------------------------------- | --------------------------------------------------- |
| `support` / tickets lifecycle      | **Implemented** on `adapter.core.support`           |
| `organizations`                    | **Implemented** on `adapter.core.organizations`     |
| `groups`                           | **Implemented** on `adapter.core.groups`            |
| `users` (support-domain)           | **Implemented** on `adapter.core.users`             |
| `articles` (conversations)         | **Implemented** on `adapter.core.articles`          |
| Attachment **metadata**            | **Implemented** via articles                        |
| Binary `attachments`               | Deferred — placeholder only                         |
| `search`                           | **Implemented** on `adapter.core.search`            |
| `history`                          | **Implemented** on `adapter.core.history`           |
| `analytics`                        | **Implemented** on `adapter.core.analytics`         |
| `webhooks`                         | **Implemented** on `adapter.core.webhooks` (registration only) |
| `events`                           | **Implemented** on `adapter.core.events` (translation only) |
| `synchronisation`                  | **Implemented** on `adapter.core.synchronisation` (in-memory) |
| Platform Event Bus / webhook ingress | Excluded until separately approved                |
| PlatformService / HTTP / UI        | Excluded until separately approved                  |

---

## Summary counts

| Category        | Count (approx.) |
| --------------- | --------------- |
| Core            | 16              |
| Optional        | 8               |
| Future          | 5               |
| Unsupported     | 2               |
| Enterprise-only | 1               |

---

## Wave 2 MVP slice (recommended)

**Must ship:** health, authentication, users, organizations, groups, tickets, articles, attachments, tags, states, priorities, events, synchronisation, diagnostics, compatibility, readiness.

**May degrade:** search, history, sla, calendars, webhooks, analytics, roles.

**Explicitly out:** GraphQL, social channels, KB authoring, trigger authoring UI, Support UI module (separate approval), webhook HTTP ingress (platform milestone), Platform Event Bus ownership.

---

## Related

- [ZAMMAD-IMPLEMENTATION-PLAN.md](./ZAMMAD-IMPLEMENTATION-PLAN.md)
- [ZAMMAD-TEST-PLAN.md](./ZAMMAD-TEST-PLAN.md)
