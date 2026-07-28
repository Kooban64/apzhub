# Deployment Guide — Test Execution 1.0.0-rc.1

## Preconditions

1. Platform PostgreSQL, Redis, and Better Auth operational.
2. Source commit contains RC tree (package, module, API routes, migrations, platform wiring).
3. Owner has accepted Certification + Risk Acceptance (done) and authorises Production Release separately after Freeze acceptance.
4. Operators acknowledge L-01…L-04 controls ([KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)).

## Steps

1. **Checkout** the RC commit (after it is persisted to source control).
2. **Install:** `pnpm install --frozen-lockfile`
3. **Migrate:** run platform Drizzle migrations including:
   - `0087_apz_qep_test_execution`
   - `0088_apz_qep_test_execution_rls`
4. **Configure** environment ([CONFIGURATION-CHECKLIST.md](./CONFIGURATION-CHECKLIST.md)):
   - `APZHUB_QEP_ENABLED` not disabled for intended environments
   - Database URL / tenant session settings per platform norms
5. **Build:** platform production build (`pnpm build` / deploy pipeline as used for other QEP capabilities).
6. **Deploy** `apps/web` with registered module `qep-test-execution`.
7. **Verify:**
   - Platform `GET /api/health` healthy
   - Authenticated `GET /api/v1/qep/executions` returns envelope (not 503)
   - Workbench `/workspace/qep/test-execution` loads for permitted users
8. **Smoke:** create draft execution (permissioned account); confirm list/detail.

## Post-deploy controls

- Restrict who holds `qep.execution.execute` / evidence association permissions while L-02 remains open.
- Do not enable consumers that require outbox dispatch (L-03).
- Track OpenAPI and PG integration-test follow-ups as release backlog (not deploy blockers for controlled release).

## Explicitly out of scope for this guide

Production Release authorisation, GA, and EvidenceAccessPort remediation engineering.
