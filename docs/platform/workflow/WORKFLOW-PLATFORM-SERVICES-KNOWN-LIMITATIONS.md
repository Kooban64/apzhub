# Workflow Platform Services — Known Limitations

> **Programme:** APZHUB-PLATFORM-WORKFLOW-004  
> **Date:** 2026-07-19

---

1. **Provider execute unsupported for n8n** — CERTIFIED_FOUNDATION adapter is read-only; `runs.start` records `PROVIDER_EXECUTE_NOT_SUPPORTED` unless a mock ops provider enables execute.
2. **Runtime registry is in-memory** — runs/schedules/tasks/notification intents are not persisted to PostgreSQL in this programme.
3. **No CredentialServiceImpl** — credential permission keys exist; binding management UI/service deferred.
4. **Schedules do not fire** — arm/pause/retire update platform metadata only; no timer worker.
5. **HITL tasks are platform-seeded** — no automatic task creation from provider step waits.
6. **NotificationService is intent-only** — no SMTP/WebSocket delivery.
7. **No HTTP / Workbench** — out of scope until separate Owner Approval.
