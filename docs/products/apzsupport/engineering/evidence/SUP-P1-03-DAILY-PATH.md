# SUP-P1-03 — Core request daily path

| Field  | Value            |
| ------ | ---------------- |
| ID     | **SUP-P1-03**    |
| Slice  | **APZSUP-103**   |
| Status | **Closed**       |
| Date   | 20260808T172500Z |

## Happy path (repository)

```text
/workspace/support
  → /workspace/support/requests              (SupportInboxView)
  → /workspace/support/requests/{id}         (SupportRequestDetailView)
  → Conversation: customer reply / internal note
  → closeSupportRequest (state/close)
```

Wired in `support-workspace-router.tsx`; HTTP via `lib/support/support-api.ts`.

No redesign — residual verification only.

## Tests

- `apps/web/components/support/support-daily-path.test.ts` — repository smoke
- Existing Playwright: `testing/playwright/e2e/oss-110-13-support-module.spec.ts` (list → detail → communicate → close)
