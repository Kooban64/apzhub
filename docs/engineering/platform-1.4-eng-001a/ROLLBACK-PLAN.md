# Rollback Plan

## Application rollback

1. Set `APZHUB_NOTIFICATION_DURABLE_RUNTIME=false`
2. Restart API/workers on previous build if needed
3. Accept that durable-only rows remain in Postgres (safe)
4. Process-local mode does **not** import Postgres queue automatically

## Schema rollback

Do **not** DROP 0066 columns in emergency rollback. Columns are nullable-compatible.

## Data

Postgres rows remain authoritative history. No destructive cleanup without Owner programme.

## Communication

Ops runbook: flag off → monitor → optional redeploy previous artefact.
