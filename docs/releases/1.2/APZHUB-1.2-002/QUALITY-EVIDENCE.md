# APZHUB-1.2-002 — Quality Evidence

> **Programme:** APZHUB-1.2-002  
> **Date:** 2026-07-20

---

| Gate          | Command / evidence                                                                        | Result        |
| ------------- | ----------------------------------------------------------------------------------------- | ------------- |
| Typecheck     | `pnpm --filter @apzhub/platform-operations typecheck`                                     | Pass          |
| Lint          | `pnpm --filter @apzhub/platform-operations lint`                                          | Pass          |
| Unit tests    | `vitest run packages/platform-operations/src/backup-restore-drill.test.ts`                | Pass (6)      |
| Regression    | `operations-control-plane` + `platform-reliability-validation` tests                      | Pass (16)     |
| Dry-run drill | `pnpm ops:backup-restore-drill -- --mode dry-run`                                         | PASS evidence |
| Live drill    | `pnpm ops:backup-restore-drill -- --mode live`                                            | PASS evidence |
| Compatibility | Additive exports only; no public API break                                                | Pass          |
| Architecture  | Ops logic in `@apzhub/platform-operations`; no Module→Connector bypass; isolated drill DB | Pass          |

## Live evidence artefact

`docs/operations/evidence/backup-restore/20260720T083654Z-R12-OPS-01-live-PASS.json`

## Architecture verification

- No Email SoR / FIN-001 / Workflow Execute changes
- No platform redesign
- No engine DB mutation (Plane/Zammad/etc.)
- Dump artefacts under `.local/ops/backup-restore/` (gitignored)
