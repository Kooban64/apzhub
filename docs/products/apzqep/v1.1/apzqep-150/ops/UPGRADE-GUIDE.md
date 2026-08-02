# APZQEP Upgrade Guide

1. Read Release Candidate / Version Manifest for the target build.
2. Backup platform PostgreSQL and Redis per Backup Procedure.
3. Deploy new `@apzhub/web` image using platform deploy steps.
4. Run `pnpm db:migrate` for platform schema only.
5. Smoke health + Cap workspaces.
6. Cap A–F IN-MEMORY state does **not** survive upgrades — treat as ephemeral until durable SoR.

Rollback: see ROLLBACK-GUIDE.md.
