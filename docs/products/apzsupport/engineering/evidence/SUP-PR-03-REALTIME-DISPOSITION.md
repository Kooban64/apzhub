# SUP-PR-03 — Realtime disposition

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-PR-03**    |
| Slice  | **APZSUP-203**   |
| Status | **Closed**       |
| Date   | 20260808T174000Z |

## Disposition (Version 1.0 Production Ready)

**Honest none** for Support product realtime.

| Layer                    | V1.0 behaviour                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Support UI               | Does **not** open EventSource unless `NEXT_PUBLIC_APZHUB_REALTIME_SSE_ENABLED=true` |
| Platform SSE             | Deny-by-default behind `APZHUB_REALTIME_SSE_ENABLED`                                |
| Help / Known Limitations | State live updates are not enabled                                                  |
| Mutations                | Remain REST request/response                                                        |

No half-enabled reconnect noise when flags are off. Enabling realtime is ops/Owner flag enablement — not Support 2.0 scope.
