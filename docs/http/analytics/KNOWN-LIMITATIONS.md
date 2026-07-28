# Analytics HTTP API — Known Limitations

> **Programme:** APZHUB-PLATFORM-ANALYTICS-005

1. **In-memory registry (MVP)** — dashboard/dataset/report/saved metadata is not yet Postgres SoR.
2. **Embed issuance** — not exposed as a dedicated HTTP resource in this programme (service-level placeholder remains).
3. **Workbench / product** — not implemented; capabilities advertise `workbenchReady=false` / `productReady=false`.
4. **Saved PATCH** — merge via list+save (no dedicated get-by-id service port).
5. **Metabase ops** — production requires Metabase integration enablement; non-prod may use `APZHUB_ANALYTICS_DOMAIN_MODE=in_memory`.
