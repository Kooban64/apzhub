# Workflow HTTP API — Known Limitations

> **Programme:** APZHUB-PLATFORM-WORKFLOW-005

1. **Provider execute** — n8n execute remains limited per CERTIFIED_FOUNDATION; readiness may report `ready_with_limitations` when provider execute is unsupported.
2. **In-memory runtime persistence (MVP)** — runtime plane may use in-memory registry depending on bootstrap mode (not a Postgres SoR redesign in this programme).
3. **Commercial product** — APZ Workflow product packaging remains out of scope; capabilities advertise `productReady=false`. Workbench is delivered under APZHUB-PLATFORM-WORKFLOW-006 (`workbenchReady=true`).
4. **Readiness AuthZ** — readiness is bootstrap-derived (no gateway service call); catalogue permission documented as `workflow.view`.
5. **Approvals list** — backed by `tasks.listInbox({ kind: "approval" })` — not a separate approval catalogue store.
6. **Schedule DELETE** — retires the schedule (lifecycle), not a hard purge.
