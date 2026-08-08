# WF-PR-02 — Business-process store fail-closed

| Field  | Value            |
| ------ | ---------------- |
| ID     | **WF-PR-02**     |
| Status | **Closed**       |
| Date   | 20260808T133000Z |

## Changes

1. `resolveBusinessProcessStore` — no silent memory fallback; memory only via explicit `APZHUB_BUSINESS_PROCESS_STORE=memory` (forbidden in production); requires `DATABASE_URL` otherwise.
2. HTTP handler — persistence failures → **503** `PERSISTENCE_UNAVAILABLE` (no memory swap).
3. Projects-Workflow bridge store — same fail-closed posture.

## Tests

- `packages/platform-services/.../resolve-business-process-store.test.ts` — **PASS**
- Bridge unit tests updated to explicit memory store for tests — **PASS**
