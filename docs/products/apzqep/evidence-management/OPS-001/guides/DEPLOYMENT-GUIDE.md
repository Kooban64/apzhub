# Deployment Guide — Evidence Management

## Package

`@apzhub/qep-evidence` ships in the APZHUB pnpm monorepo and is consumed by:

- `packages/platform-services` (gateway surface `qep.evidence`)
- `apps/web` REST handlers under `/api/v1/qep/evidence`
- `apps/web` Workbench under `/workspace/qep/evidence`
- `modules/qep-evidence/module.yaml` (manifest artefact)

## Prerequisites

1. Platform web app deployable (Next.js).
2. `DATABASE_URL` available when enabling QEP platform services (shared QEP gate).
3. `APZHUB_QEP_ENABLED` not set to false/0/off.

## Deploy steps

1. Install workspace dependencies (`pnpm install`).
2. Build platform packages / web as per host release process.
3. Ensure QEP platform services bootstrap succeeds.
4. Smoke: authenticated `GET /api/v1/qep/evidence` (expect 200/empty or data) and Workbench `/workspace/qep/evidence`.

## Important

Evidence persistence for this release line is **in-memory**. Do not treat deployment as durable Evidence SoR until a storage programme completes.
