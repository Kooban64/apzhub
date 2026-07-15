# Zammad → APZHUB Canonical Mapping

> **Purpose:** Complete concept map from Zammad engine entities to APZHUB Support domain  
> **Audience:** Engineers, AI agents, reviewers  
> **Authoritative references:** [002 — Terminology](../002-product-naming-positioning-terminology-standard.md) · [ZAMMAD-ARCHITECTURE](./ZAMMAD-ARCHITECTURE.md) · [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md) · ADR-0048 ID conventions (platform global IDs)  
> **Status:** Discovery — authoritative for OSS-102 design  
> **Last updated:** 2026-07-10  
> **Milestone:** OSS-102-01

---

## Mapping principles

1. **User-facing:** APZHUB names only — never “Zammad”, raw group/role names, or engine field names in UI.
2. **API responses:** APZHUB DTOs with opaque platform global IDs.
3. **Adapter-internal:** Zammad numeric IDs and payloads stay inside `@apzhub/integration-zammad`.
4. **Platform metadata:** EntityMappingStore links platform IDs ↔ Zammad IDs (not inside the adapter).
5. **Terminology conflict:** Zammad **Ticket** must **not** map to Projects **Task** (Plane). Support owns tickets.

### Rejected naive mapping

| Naive example                      | Why rejected                                                      |
| ---------------------------------- | ----------------------------------------------------------------- |
| Ticket → Task                      | **Task** is reserved for Projects (Plane). Collides with OSS-101. |
| SupportAdapter as user-facing name | Engine adapters are internal; UI says Support                     |

**Canonical:** Zammad Ticket → APZHUB **Support Request** (DTO: `SupportTicket` / service: `SupportService`).

---

## Primary concept table

| Zammad (engine)                 | APZHUB (user/API)                     | Cardinality     | Notes                                                                                                                          |
| ------------------------------- | ------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Ticket                          | **Support Request** (`SupportTicket`) | 1:1             | Primary SoR in Zammad                                                                                                          |
| Article                         | **Comment** / **Message**             | 1:N per ticket  | Public vs internal via visibility flag                                                                                         |
| Article (type `note`, internal) | **Internal note**                     | 1:N             | Subtype of comment                                                                                                             |
| Attachment                      | **Attachment**                        | 1:N per article | Metadata in platform; bytes via engine                                                                                         |
| Organization                    | **Organisation**                      | 1:1             | Spelling: APZHUB uses Organisation in UK English docs; code may use `Organization` DTO alias — pick one in contracts milestone |
| Group                           | **Support Team** / **Queue**          | 1:1             | Not Projects “Team” without qualifier                                                                                          |
| Role                            | _(no UI name)_                        | N:M users       | Translated via PermissionService; never shown                                                                                  |
| User (agent)                    | **Agent** / platform User             | 1:1 mapped      | Platform identity is SoR for people                                                                                            |
| User (customer)                 | **Requester** / **Customer**          | 1:1 mapped      | May link to Law client later                                                                                                   |
| Tag                             | **Label** / **Tag**                   | N:M             | Prefer **Tag** in Support UX to avoid Projects Label confusion — or namespace as Support Tag                                   |
| Ticket state                    | **Status**                            | 1:1 catalogue   | Map state → status; state_type informs semantics                                                                               |
| Ticket priority                 | **Priority**                          | 1:1 catalogue   | Map to platform priority enum                                                                                                  |
| SLA                             | **SLA policy**                        | 1:N tickets     | Engine-owned; expose breach signals                                                                                            |
| Calendar (business hours)       | **Business hours calendar**           | 1:N SLAs        | Optional                                                                                                                       |
| Trigger                         | **Automation rule** (engine)          | —               | Not authored in APZHUB Wave 2                                                                                                  |
| Macro                           | **Macro** (engine)                    | —               | Optional execute later                                                                                                         |
| Overview                        | **Saved view**                        | —               | Optional; native filters preferred                                                                                             |
| Webhook (outbound)              | **Integration webhook**               | —               | Translate to platform events                                                                                                   |
| Ticket history                  | **Activity**                          | 1:N             | Derived activity entries                                                                                                       |
| Mention / watcher-like          | **Watcher** / **Follower**            | N:M             | If API exposes mentions                                                                                                        |
| Knowledge base answer           | **Help article**                      | —               | Future / optional                                                                                                              |
| Online notification             | _(platform Attention)_                | —               | Do not duplicate in adapter                                                                                                    |

---

## Relationship mappings

```text
Organisation
  └── Users (customers)
        └── Support Requests (as requester)

Support Team (Group)
  └── Support Requests
        ├── Status
        ├── Priority
        ├── Tags
        ├── Assignee (agent user)
        ├── Articles (Comments / Notes / Channel messages)
        │     └── Attachments
        ├── SLA timers / escalation flags
        └── Activity (history)

Platform Tenant
  └── Mapping rows (SupportTicket, Organisation, Group, User, …)
```

### Cross-product links (future extension points)

| Link                             | Direction                          | Wave                                   |
| -------------------------------- | ---------------------------------- | -------------------------------------- |
| Support Request ↔ Project / Task | Reference IDs in platform metadata | After Projects UI / explicit milestone |
| Support Request ↔ Law Matter     | Reference IDs                      | Law + Support integration milestone    |
| Support Request ↔ Document       | Attachment or Paperless link       | Documents wave                         |
| Requester ↔ Law Client           | Identity mapping                   | Future                                 |

---

## Cardinality highlights

### One-to-many

| Parent               | Children                                           |
| -------------------- | -------------------------------------------------- |
| Support Request      | Articles, tags, history entries, SLA breach events |
| Article              | Attachments                                        |
| Organisation         | Users, tickets                                     |
| Support Team (Group) | Tickets, agent memberships                         |

### Many-to-one

| Child           | Parent                                                         |
| --------------- | -------------------------------------------------------------- |
| Support Request | Organisation (optional), Group (required), Requester, Assignee |
| Article         | Support Request, Author user                                   |

### Many-to-many

| A       | B                           |
| ------- | --------------------------- |
| Users   | Roles                       |
| Users   | Groups (permissions)        |
| Tickets | Tags                        |
| Users   | Organizations (shared orgs) |

### One-to-one

| A                  | B                                                     |
| ------------------ | ----------------------------------------------------- |
| Platform global ID | Zammad ID (per entity type + tenant) via MappingStore |
| Platform user      | Zammad user (when provisioned)                        |

---

## Unsupported / deferred concepts (Wave 2 core)

| Zammad concept                              | Status             | Reason                               |
| ------------------------------------------- | ------------------ | ------------------------------------ |
| GraphQL                                     | Unsupported        | No first-party API                   |
| Twitter/Facebook/Telegram channel authoring | Deferred           | Channel sprawl; email/web/note first |
| CTI / chat live sessions                    | Deferred           | Optional later                       |
| Knowledge base authoring                    | Future             | Optional capability                  |
| Trigger/macro authoring UI in APZHUB        | Unsupported Wave 2 | Engine admin owns automation         |
| Customer-facing Zammad portal               | Unsupported        | APZHUB UI only                       |
| Raw role administration in UI               | Unsupported        | PermissionService owns authz UX      |

---

## ID strategy (preview — see implementation plan)

| Layer             | ID                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Client            | `sreq_…` (support request), `sorg_…`, `sgrp_…`, `cmt_…` — exact prefixes locked in contracts ADR |
| Platform Services | Platform global IDs                                                                              |
| Adapter           | Zammad integer IDs                                                                               |
| MappingStore      | `(tenantId, entityType, platformId, providerId, provider="zammad")`                              |

---

## Field mapping sketch (Support Request)

| Zammad field                | APZHUB field         | Notes                                      |
| --------------------------- | -------------------- | ------------------------------------------ |
| `id`                        | mapping.providerId   | Never client-visible                       |
| `number` / `number` display | `displayId` optional | Human ticket number                        |
| `title`                     | `title`              |                                            |
| `group_id`                  | `teamId` (platform)  | Via mapping                                |
| `customer_id`               | `requesterId`        | Via mapping                                |
| `owner_id`                  | `assigneeId`         | Via mapping                                |
| `state_id` / state name     | `statusId` / status  | Catalogue map                              |
| `priority_id`               | `priority`           | Enum map                                   |
| `organization_id`           | `organisationId`     |                                            |
| `tags`                      | `tags[]`             |                                            |
| `created_at` / `updated_at` | timestamps           | ISO-8601                                   |
| article[]                   | comments             | Separate resources preferred in APZHUB API |

---

## Article → Support Article mapping (OSS-102-04)

| Zammad         | APZHUB `SupportArticle`                        |
| -------------- | ---------------------------------------------- |
| `id`           | provisional `sart_zammad_{id}`                 |
| `ticket_id`    | `supportTicketId` (`sreq_zammad_*`)            |
| `body`         | `body`                                         |
| `content_type` | `bodyFormat`                                   |
| `internal`     | `visibility: internal \| public`               |
| `type`         | `channel`                                      |
| `sender`       | `senderType` / `author.senderType`             |
| `from`/`to`/`cc` | `recipients` / author email                  |
| attachments    | `SupportArticleAttachment` metadata only       |

**Not** Projects `Comment`. Binary attachment transfer is out of scope for OSS-102-04.

---

## Related

- [ZAMMAD-CAPABILITY-MATRIX.md](./ZAMMAD-CAPABILITY-MATRIX.md)
- [ZAMMAD-ARCHITECTURE.md](./ZAMMAD-ARCHITECTURE.md)
