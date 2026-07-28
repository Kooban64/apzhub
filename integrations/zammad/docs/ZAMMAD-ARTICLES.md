# Zammad Articles (`adapter.core.articles`)

**Milestone:** OSS-102-04  
**Package:** `@apzhub/integration-zammad` **v0.3.0**  
**Access:** `adapter.core.articles` (`ZammadArticleService`)

---

## Purpose

Canonical Support **conversation articles** (Zammad ticket articles / messages).  
**Not** Projects `Comment`. **Not** Projects `Task`.

```text
adapter.core.articles
  → ZammadArticleService
  → ZammadOperationRunner
  → ZammadRestClient
  → /api/v1/ticket_articles*
```

---

## Distinction

| Concept                   | Domain   | DTO              |
| ------------------------- | -------- | ---------------- |
| Support Request           | Support  | `SupportTicket`  |
| Support Article / Message | Support  | `SupportArticle` |
| Project Task              | Projects | `Task`           |
| Project Comment           | Projects | `Comment`        |

---

## Supported operations

| Method        | Operation name                | Notes                                               |
| ------------- | ----------------------------- | --------------------------------------------------- |
| `list`        | `zammad.articles.list`        | By support ticket; filter/sort/paginate client-side |
| `get`         | `zammad.articles.get`         | Verifies ticket relationship                        |
| `createNote`  | `zammad.articles.createNote`  | **Always** `internal=true`, channel `note`          |
| `createReply` | `zammad.articles.createReply` | **Always** `internal=false`                         |
| `create`      | routes to note/reply          | Requires explicit `visibility`                      |

### Unsupported mutations

Zammad CE public API does **not** reliably support article update/delete.  
These operations are **not** exposed. Diagnostics list `unsupportedArticleMutations: ["update","delete"]`.

---

## Visibility rules

| Canonical  | Zammad `internal` | Default create behaviour              |
| ---------- | ----------------- | ------------------------------------- |
| `internal` | `true`            | `createNote` — never customer-visible |
| `public`   | `false`           | `createReply` — customer-visible      |

Internal-note creation **never** defaults to public. Tests assert request payload `internal === true`.

---

## Channel mapping

| Zammad `type` (examples)          | Canonical `SupportArticleChannel` |
| --------------------------------- | --------------------------------- |
| `note`                            | `note`                            |
| `email`, `email outbound/inbound` | `email`                           |
| `phone`                           | `phone`                           |
| `web`                             | `web`                             |
| `chat`                            | `chat`                            |
| `sms`                             | `sms`                             |
| `fax`                             | `fax`                             |
| unknown / social                  | `unknown`                         |

Unknown values map safely to `unknown` without corrupting the model.

---

## Body formats

| Canonical    | Zammad `content_type` |
| ------------ | --------------------- |
| `text/plain` | `text/plain` / `text` |
| `text/html`  | contains `html`       |
| `unknown`    | other                 |

The adapter **does not** sanitise or render HTML. Presentation sanitisation is a future consumer responsibility.

---

## Author & recipients

- Authors map to `SupportArticleAuthor` (`userId` provisional `suser_zammad_*` when `created_by_id` present).
- Sender types: agent / customer / system / unknown.
- Recipients: `to`, `cc`, `bcc`, `replyTo` — optional per channel.
- Do not log recipient lists or article bodies in diagnostics.

---

## Attachment metadata

Supported on article DTOs:

- id, filename, contentType, sizeBytes, disposition, contentId, createdAt

**Implemented (R12-SUP-02):** binary upload (base64 on create) and download (`downloadAttachment` / CE `ticket_attachment`). Max 1 MiB.  
**Not implemented:** attachment delete, streaming, object storage, virus scan, preview.

`attachments` capability is certified for upload/download (R12-SUP-02); delete remains unsupported.

Inline `dataBase64` on create descriptors is optional for provider association only — never filesystem paths.

---

## IDs

| Entity     | Provisional prefix |
| ---------- | ------------------ |
| Article    | `sart_zammad_`     |
| Attachment | `satt_zammad_`     |
| Ticket     | `sreq_zammad_`     |

---

## API assumptions (CE 6.3.0–6.5.x)

- `GET /api/v1/ticket_articles/by_ticket/{id}`
- `GET /api/v1/ticket_articles/{id}`
- `POST /api/v1/ticket_articles`
- Update/delete: unsupported in this adapter

---

## Related

- [ZAMMAD-ADAPTER.md](./ZAMMAD-ADAPTER.md)
- [ZAMMAD-MAPPING.md](../../docs/architecture/ZAMMAD-MAPPING.md)
- [OSS-102-04 Completion Report](../../docs/sprint/OSS-102-04-completion-report.md)
