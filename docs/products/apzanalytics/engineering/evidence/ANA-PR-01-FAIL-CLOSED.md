# ANA-PR-01 — Fail-closed adapter / bootstrap

| Field  | Value            |
| ------ | ---------------- |
| ID     | **ANA-PR-01**    |
| Slice  | **APZAN-201**    |
| Status | **Closed**       |
| Date   | 20260808T185500Z |

## Disposition

| Condition                                             | Behaviour                               |
| ----------------------------------------------------- | --------------------------------------- |
| Analytics HTTP disabled                               | **503** `ANALYTICS_SERVICE_UNAVAILABLE` |
| Decision intelligence construct failure in production | **503** — no silent memory fallback     |
| Non-prod construct failure                            | Memory store for local isolation only   |

Paths: `handlers/analytics.ts` · `handlers/decision-intelligence.ts` · gateway bootstrap.
