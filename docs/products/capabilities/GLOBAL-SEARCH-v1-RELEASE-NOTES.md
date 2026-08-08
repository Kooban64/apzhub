# Global Search v1.0 — Release Notes

| Field      | Value                   |
| ---------- | ----------------------- |
| Capability | Global Search v1.0      |
| Status     | **Awaiting Owner RC1**  |
| Engine     | APS-Search / APE-Search |

## Shipped

- Seven product providers (Projects, Support, Workflow, Knowledge, Time, Analytics, QEP)
- `GET /api/v1/platform/search?q=` fan-out aggregator + permission filter + product deep links
- Workbench Ctrl+K + header Search trigger
- Grouped results; navigation stays on `/workspace/...` paths
- Unit tests + Playwright `apz-global-search-v1.spec.ts` (1/1 PASS)

## Out of scope (later)

Realtime indexing UX · saved searches · AI/semantic search · ranking ML
