# APZQEP-ENG-010 — Development Guide

> **Programme:** APZQEP-ENG-010  
> **Status:** IMPLEMENTED / AWAITING OWNER ACCEPTANCE  
> **Audience:** Engineers working on APZ QEP foundation and future domain programmes

## Prerequisites

| Requirement | Version / note                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Node.js     | ≥20 (CI uses 22)                                                                                     |
| pnpm        | `10.22.0` (see root `packageManager`)                                                                |
| Docker      | For platform PostgreSQL and Redis (existing dev compose)                                             |
| Git         | Trunk-based workflow per [BRANCHING-AND-VERSIONING](../../../operations/BRANCHING-AND-VERSIONING.md) |

## Local setup

QEP development uses the **existing APZHUB monorepo** infrastructure. No separate QEP repository or compose stack is required.

### 1. Clone and install

```bash
cd /home/ubuntu/apz-portal   # or your clone path
pnpm install
```

`pnpm install` discovers QEP packages via workspace globs (`packages/qep-*`, `integrations/qep-github`).

### 2. Start platform services (optional for QEP unit work)

QEP foundation unit tests do **not** require a running database. For full platform development (shell, auth, existing modules):

```bash
pnpm docker:up          # infrastructure/docker/docker-compose.dev.yml
pnpm db:migrate         # when working on platform DB features
pnpm dev                # apps/web on configured PORT (default 3300)
```

See [ENVIRONMENT.md](../../../../ENVIRONMENT.md) for host coexistence with legacy `apz-stack` — QEP dev ports must remain non-conflicting.

### 3. Verify QEP foundation

Run these commands after any QEP foundation change:

```bash
pnpm test:qep
pnpm typecheck:qep
pnpm audit:qep-foundation
```

| Script                      | What it runs                                                             |
| --------------------------- | ------------------------------------------------------------------------ |
| `pnpm test:qep`             | Vitest on `packages/qep-*` and `integrations/qep-github`                 |
| `pnpm typecheck:qep`        | TypeScript check on `@apzhub/qep-*` and `@apzhub/integration-qep-github` |
| `pnpm audit:qep-foundation` | Structural audit via `scripts/apzqep-eng-010-foundation-audit.mjs`       |

Expected audit output:

```text
APZQEP-ENG-010 foundation audit PASS
 modules=22 services=16 events=8 packages=5
```

### 4. Full monorepo quality (recommended before PR)

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
```

Root CI (`.github/workflows/ci.yml`) runs the full quality pipeline including coverage and E2E for the platform.

## Project layout for developers

| If you are working on…        | Start here                                |
| ----------------------------- | ----------------------------------------- |
| Module catalogue / IDs        | `packages/qep-types/src/module-ids.ts`    |
| Service contract markers      | `packages/qep-contracts/src/index.ts`     |
| Foundation health             | `packages/qep-foundation/src/registry.ts` |
| UI placeholders               | `packages/qep-ui/src/index.ts`            |
| Module registration metadata  | `modules/qep-*/module.yaml`               |
| Service registration metadata | `services/qep/services/*/service.yaml`    |
| Event contracts               | `events/qep/*/event.yaml`                 |
| GitHub connector stub         | `integrations/qep-github/`                |
| Test fixtures                 | `testing/qep/fixtures/`                   |

See [REPOSITORY-STRUCTURE.md](./REPOSITORY-STRUCTURE.md) for the complete map.

## Contribution workflow

### Programme gate

- **APZQEP-ENG-010** is foundation only. Do not add business domain logic until Owner Acceptance and explicit authorisation of downstream programmes (e.g. **APZQEP-ENG-020**).
- Platform packages remain authoritative — do not bypass shell, auth, or gateway layers.

### Branch naming

Per [BRANCHING-AND-VERSIONING.md](../../../operations/BRANCHING-AND-VERSIONING.md):

```text
feature/apzqep-eng-020-<slug>    # domain programmes after Acceptance
feature/apzqep-eng-010-<slug>    # foundation fixes only while ENG-010 open
```

Programme IDs in branch names when work is programme-bound.

### Pull requests

Every PR must:

1. Link programme ID (**APZQEP-ENG-010** or authorised successor).
2. Pass CI (lint, typecheck, format, test, build).
3. Run `pnpm audit:qep-foundation` when touching QEP foundation paths.
4. Follow [CODE-REVIEW-STANDARD.md](../../../operations/CODE-REVIEW-STANDARD.md).
5. Update documentation when structure or status changes.
6. Stay within Owner-approved scope — no scope creep into domain features.

### Commit messages

Follow repository conventions:

- **Imperative mood**, concise subject (≤72 characters).
- Reference programme ID in body when not obvious from branch name.
- Example: `fix(qep): correct module M10 slug in types catalogue` with body `APZQEP-ENG-010 — audit alignment`.

No `--no-verify` unless Owner-documented exception.

### Code standards

| Standard                                 | Enforcement                                                    |
| ---------------------------------------- | -------------------------------------------------------------- |
| TypeScript strict                        | Root `tsconfig`; package-level `tsconfig.json`                 |
| ESLint                                   | Root `eslint` config; `pnpm lint`                              |
| Prettier                                 | `pnpm format:check`                                            |
| No secrets in repo                       | Env templates only; connector refs not plain secrets (013)     |
| Manifest first                           | Update `*.yaml` manifests before implementation code (024–029) |
| No business logic in foundation packages | Enforced by audit script                                       |

## Adding new QEP artefacts (domain programmes only)

When authorised programmes extend the foundation:

1. Add or update manifest (`module.yaml`, `service.yaml`, `event.yaml`, `integration.yaml`) **first**.
2. Register types in `@apzhub/qep-types` if new catalogue entries are needed.
3. Add contracts to `@apzhub/qep-contracts` — keep `implemented: false` until service logic exists.
4. Add Vitest tests alongside implementation.
5. Update audit script thresholds if catalogue size changes (with Owner approval).
6. Update this documentation pack.

## Troubleshooting

| Issue                                          | Resolution                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| `audit:qep-foundation` fails on missing README | Ensure `docs/products/apzqep/engineering/README.md` exists          |
| Module count ≠ 22                              | Verify all `modules/qep-*/module.yaml` present; check audit output  |
| Typecheck fails on QEP packages                | Run `pnpm typecheck:qep` in isolation; fix package `tsconfig` paths |
| Workspace package not found                    | Confirm `package.json` name matches `@apzhub/qep-*` filter          |
| Forbidden function in audit                    | Remove domain operation exports from foundation packages            |

## Related documents

- [ENGINEERING-FOUNDATION.md](./ENGINEERING-FOUNDATION.md) — principles and scope
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) — Vitest and fixture usage
- [CI-CD.md](./CI-CD.md) — pipeline participation
- [QUALITY-GATES.md](./QUALITY-GATES.md) — mandatory gates
- [../engineering-plan/SPRINT-ZERO.md](../engineering-plan/SPRINT-ZERO.md) — planning intent
