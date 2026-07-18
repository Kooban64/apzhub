# Zammad History (`adapter.core.history`)

**Milestone:** OSS-102-05  
**Package:** `@apzhub/integration-zammad` **v0.4.0**  
**Access:** `adapter.core.history` (`ZammadHistoryService`)

---

## Purpose

Read-only Support Request **history / audit timeline**. Provider history rows are mapped to vendor-neutral `SupportHistoryEvent` / `SupportTimeline` contracts.

```text
adapter.core.history
  → ZammadHistoryService
  → ZammadOperationRunner
  → ZammadRestClient
  → GET /api/v1/ticket_history/{id}
```

---

## Supported operations

| Method               | Operation              | Notes                     |
| -------------------- | ---------------------- | ------------------------- |
| `getSupportTimeline` | full timeline          | Chronological ascending   |
| `getTimeline`        | paged/filtered         | Alias surface for list UX |
| `list`               | alias of `getTimeline` |                           |

All operations are **read-only**.

---

## Canonical models

| Contract                    | Role                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `SupportHistoryEvent`       | Single timeline event                                                                           |
| `SupportHistoryActor`       | Agent / customer / system / unknown                                                             |
| `SupportHistoryAction`      | created, state/owner/priority/customer/org/group changes, article, attachment metadata, unknown |
| `SupportHistoryFieldChange` | Optional from/to field values                                                                   |
| `SupportTimeline`           | Ticket-scoped event collection                                                                  |

Provisional IDs: `shist_zammad_*`.

---

## Timeline mapping

| Provider signal (examples)     | Canonical action       |
| ------------------------------ | ---------------------- |
| created / create               | `created`              |
| state / state_id               | `state_changed`        |
| owner / owner_id               | `owner_changed`        |
| priority / priority_id         | `priority_changed`     |
| customer / customer_id         | `customer_changed`     |
| organization / organization_id | `organization_changed` |
| group / group_id               | `group_changed`        |
| article object                 | `article_created`      |
| attachment attribute / object  | `attachment_added`     |
| other                          | `unknown`              |

Events are sorted chronologically by `occurredAt`.

---

## Filtering / paging / sorting

- Filter: `actions`, `actorId`, `occurredAfter`, `occurredBefore`
- Page: `page`, `perPage`
- Sort: `occurredAt`

---

## Limitations

- Read-only — no history mutation
- Unknown provider events map safely to `unknown`
- Actor display names may be partial until user enrichment lands later

---

## Related

- [ZAMMAD-ADAPTER.md](./ZAMMAD-ADAPTER.md)
- [OSS-102-05 Completion Report](../../docs/sprint/OSS-102-05-completion-report.md)
