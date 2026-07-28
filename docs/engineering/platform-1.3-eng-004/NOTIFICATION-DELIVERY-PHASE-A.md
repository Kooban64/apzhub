# Notification Delivery Phase A

Option D hybrid service implemented under APZNOTIFY ownership.

- Intake: Event Bus (Observe/Support authorised types) + command `createIntent`
- Routing: validate → resolve → policy → preference → channel chain → adapter
- Channel: **in_app** (mandatory baseline)
- SMTP: **DEFERRED** (no approved outbound path in repository)
- Realtime: ADR-0072 SSE wire events only (`notification.created|updated|read|expired`)
