# Law Platform API — Pagination

> **Story:** LAW-014-07  
> **Authority:** [LAW-API-Pagination-and-Filtering.md](../specs/LAW-API-Pagination-and-Filtering.md)

---

## Cursor pagination

List endpoints return:

```json
{
  "ok": true,
  "data": [],
  "pagination": {
    "limit": 25,
    "hasMore": true,
    "nextCursor": "eyJvZmZzZXQiOjI1fQ",
    "prevCursor": null
  },
  "meta": {}
}
```

---

## Parameters

| Parameter | Default           | Max | Description                                       |
| --------- | ----------------- | --- | ------------------------------------------------- |
| `limit`   | 25                | 100 | Page size                                         |
| `cursor`  | —                 | —   | Opaque cursor from previous response              |
| `sort`    | resource-specific | —   | Comma-separated fields; prefix `-` for descending |

---

## Example

```http
GET /api/law/v1/clients?limit=10&sort=displayName
GET /api/law/v1/clients?limit=10&cursor=eyJvZmZzZXQiOjEwfQ&sort=displayName
```

---

## Sort fields

| Resource  | Default sort  | Supported                             |
| --------- | ------------- | ------------------------------------- |
| Clients   | `displayName` | `displayName`, `status`               |
| Matters   | `title`       | `title`, `matterStatus`, `priority`   |
| Documents | `title`       | `title`, `documentStatus`             |
| Tasks     | `title`       | `title`, `taskStatus`, `taskPriority` |

See OpenAPI `sort` parameter on each list operation.
