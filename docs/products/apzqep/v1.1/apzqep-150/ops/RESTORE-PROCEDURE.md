# APZQEP Restore Procedure

1. Restore platform PostgreSQL/Redis per `docs/operations/RESTORE-PROCEDURES.md`.
2. Redeploy web.
3. Verify `GET /api/health`.
4. Expect Cap A–F workspaces empty after process restart unless durable SoR is later delivered.
