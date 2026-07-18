# Zammad Search (`adapter.core.search`)

**Milestone:** OSS-102-05  
**Package:** `@apzhub/integration-zammad` **v0.4.0**  
**Access:** `adapter.core.search` (`ZammadSearchService`)

---

## Purpose

Canonical Support **search** across support requests, organizations, groups, users, and articles.

Zammad query syntax is **never** exposed publicly. Callers pass plain query text, optional kind/field filters, pagination, and sort — the adapter composes provider calls internally and returns canonical `SupportSearchResult` hits only.

```text
adapter.core.search
  → ZammadSearchService
  → ZammadOperationRunner
  → ZammadRestClient
  → /api/v1/tickets/search | organizations/search | users/search | groups (+ client filter) | ticket_articles*
```

---

## Supported operations

| Method                  | Operation              | Notes                                                     |
| ----------------------- | ---------------------- | --------------------------------------------------------- |
| `search`                | `zammad.search.search` | Unified search; optional `kinds` filter                   |
| `searchSupportRequests` | scoped                 | `kinds: ["support_request"]`                              |
| `searchOrganizations`   | scoped                 |                                                           |
| `searchGroups`          | scoped                 | List + client-side text filter (CE may lack group search) |
| `searchUsers`           | scoped                 |                                                           |
| `searchArticles`        | scoped                 | Scans articles for tickets matching the query             |

---

## Canonical result

`SupportSearchHit` / `SupportSearchResult` from `@apzhub/platform-service-contracts`.

Hit kinds: `support_request` | `organization` | `group` | `user` | `article`.

Provisional hit IDs: `shit_{kind}_zammad_*`.

---

## Filtering / paging / sorting

- Filter: `kinds`, `supportTicketId`, `organizationId`, `groupId`
- Page: `page`, `perPage`
- Sort: `score` | `updatedAt` | `title`

---

## Limitations

- Provider query DSL is internal only
- Group search is best-effort via list + filter
- Article search is inventory-scoped (matching tickets first)
- No Platform Search Service registration in this milestone

---

## Related

- [ZAMMAD-ADAPTER.md](./ZAMMAD-ADAPTER.md)
- [OSS-102-05 Completion Report](../../docs/sprint/OSS-102-05-completion-report.md)
