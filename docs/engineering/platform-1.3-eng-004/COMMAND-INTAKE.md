# Command Intake

`POST /api/v1/notifications/intents` and Platform Service `createIntent` / cancel / retry / replay / in-app read mutations.

Pipeline: auth → ProductionAuthorizationProvider → tenant/org scope → validation → audit → idempotency.
