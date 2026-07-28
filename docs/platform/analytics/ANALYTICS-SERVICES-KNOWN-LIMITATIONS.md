# Analytics Platform Services — Known Limitations

> **Programme:** APZHUB-PLATFORM-ANALYTICS-004

1. **Registry is in-memory** — not durable multi-instance SoR; Postgres persistence deferred.
2. **Embed tokens** — session metadata / opaque `tokenRef` only; Metabase signed embed issuance not implemented.
3. **No HTTP / Workbench / APZ Analytics product** — services only.
4. **Report catalogue** — resolves Reporting SoR links; does not generate reports.
5. **KPI view** — permission `analytics.kpi.view` (also covered by `analytics.view`); KPI definitions remain Metrics SoR.
6. **Collections sync** — Metabase collections are not auto-synced into the registry in this programme.
7. **Provider admin** — Metabase admin REST remains adapter-internal.
