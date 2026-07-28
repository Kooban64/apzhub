# Dead-Letter Persistence

When non-retryable or attempts exhausted:

- `status=permanent_failure`
- `dead_letter=true`
- `terminal_at` set
- attempt finished with failure metadata
- lease cleared

No automatic replay · no admin UI (P4).
