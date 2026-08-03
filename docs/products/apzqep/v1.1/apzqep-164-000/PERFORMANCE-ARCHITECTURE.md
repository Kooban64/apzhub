# PERFORMANCE-ARCHITECTURE — APZQEP-164-000

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-164-000   |
| Timestamp | 20260803T191002Z |

## Goals

Dashboards feel responsive under enterprise data volumes without moving SoR into the browser.

## Strategies

| Concern              | Architecture approach                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Caching              | Server-side projection cache (Redis) with tenant keys; short TTL + event invalidation from QI/Automation/SCM events |
| Incremental refresh  | Widget-level refresh; avoid full-page reload                                                                        |
| Streaming updates    | SSE/WebSocket for live execution/ops strips where authorised; fallback to poll                                      |
| Large datasets       | Pagination, windowed queries, chart downsampling                                                                    |
| Aggregation          | Pre-aggregated rollups in projection services — not ad-hoc full scans in request handlers                           |
| Historical snapshots | Immutable snapshot tables/projections for trend charts                                                              |
| Performance budgets  | Target: landing interactive < 2s p95 warm cache; widget data < 500ms p95 typical; media viewers progressive         |

## Rules

1. Never long-running aggregation in Next.js request handlers — use jobs/projections (012).
2. Correlation IDs on all dashboard data fetches.
3. Circuit breakers remain on connectors; dashboards must degrade gracefully (stale/partial banners).
