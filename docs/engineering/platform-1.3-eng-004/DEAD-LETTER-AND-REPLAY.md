# Dead Letter and Replay

`deadLetter` on delivery record + terminal status. `POST .../dead-letter/:id/replay` requires `notifications.retry`, scoped, idempotent, audited.
