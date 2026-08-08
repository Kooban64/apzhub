# KNW-PR-01 — Fail-closed store

| Field  | Value         |
| ------ | ------------- |
| ID     | **KNW-PR-01** |
| Status | **Closed**    |

Production: no silent memory fallback. Handler → 503 when store unavailable. Paths: `resolveOrganisationalMemoryStore`, `handlers/organisational-memory.ts`.
