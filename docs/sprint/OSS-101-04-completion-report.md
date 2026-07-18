# OSS-101-04 Completion Report — Plane Adapter Foundation

**Status:** Complete  
**Date:** 2026-07-10  
**Scope:** OSS-101-04 only — no OSS-101-05+, no OSS-102 (Zammad)

---

## Executive summary

Delivered the first production integration adapter for Plane CE in `@apzhub/integration-plane` v0.1.0. `PlaneAdapter` extends `IntegrationAdapterBase`, uses `AdapterContext` / `AdapterFactory`, registers capabilities via manifest, implements typed configuration, API-key authentication, connection lifecycle, health, version discovery, error translation, diagnostics, logging, and metrics — all through the Integration SDK without duplicated cross-cutting logic.

The milestone validates the OSS-100 adapter framework and establishes the reference pattern for Zammad, Kimai, Paperless, and future adapters.

**Stop condition met:** OSS-101-05 not started. OSS-102 not started. Await owner approval.

---

## Architecture overview

```text
createPlaneAdapter()
  → createPlaneBootstrapConfiguration()   # manifest + connection defaults
  → createInMemoryCapabilityRegistration()
  → buildAdapterContext()                 # SDK DI
  → new PlaneAdapter(context, config)
       → PlaneFetchClient (IntegrationClient)
       → PlaneClient (internal REST)
       → PlaneVendorErrorMapper
```

| Layer           | Component                                                      |
| --------------- | -------------------------------------------------------------- |
| SDK foundation  | `IntegrationAdapterBase`, `AdapterContext`, `AdapterFactory`   |
| Bootstrap       | `createPlaneBootstrapConfiguration`, capability manifest       |
| Adapter         | `PlaneAdapter` — lifecycle hooks only                          |
| Transport       | `PlaneFetchClient` — temporary until OSS-100-06 HTTP transport |
| Internal client | `PlaneClient` — instance/workspace probes                      |
| Errors          | `PlaneVendorErrorMapper`                                       |
| Factory         | `createPlaneAdapter` / `disposePlaneAdapter`                   |

---

## Files created

| Path                                                    | Purpose                            |
| ------------------------------------------------------- | ---------------------------------- |
| `integrations/plane/package.json`                       | `@apzhub/integration-plane` v0.1.0 |
| `integrations/plane/tsconfig.json`                      | Package TS config                  |
| `integrations/plane/docs/PLANE-ADAPTER.md`              | Adapter documentation              |
| `integrations/plane/src/plane-config.ts`                | Typed configuration + validation   |
| `integrations/plane/src/plane-bootstrap.ts`             | Manifest and connection bootstrap  |
| `integrations/plane/src/plane-error-mapper.ts`          | `PlaneVendorErrorMapper`           |
| `integrations/plane/src/plane-adapter.ts`               | `PlaneAdapter`                     |
| `integrations/plane/src/plane-factory.ts`               | Factory helpers                    |
| `integrations/plane/src/index.ts`                       | Public exports                     |
| `integrations/plane/src/internal/plane-api-types.ts`    | Internal API shapes                |
| `integrations/plane/src/internal/plane-fetch-client.ts` | Fetch transport                    |
| `integrations/plane/src/internal/plane-client.ts`       | Internal REST client               |
| `integrations/plane/src/testing/mock-plane-api.ts`      | Test fixtures                      |
| `integrations/plane/src/*.test.ts`                      | 24 unit tests (5 files)            |
| `docs/sprint/OSS-101-04-completion-report.md`           | This report                        |

---

## Files modified

| Path                                                     | Change                                                   |
| -------------------------------------------------------- | -------------------------------------------------------- |
| `tsconfig.base.json`                                     | `@apzhub/integration-plane` path alias                   |
| `vitest.config.ts`                                       | Integration test include + aliases                       |
| `packages/integration-sdk/src/adapter/manifest-types.ts` | `headerName` on `AdapterConnectionDefaults` (defect fix) |
| `packages/integration-sdk/src/adapter/adapter-base.ts`   | Pass auth fields to connection register                  |
| `docs/foundation/CURRENT-STATE.md`                       | OSS-101-04 complete                                      |
| `docs/foundation/CURRENT-MILESTONE.md`                   | Stop at OSS-101-04                                       |
| `docs/foundation/ACTIVE-BACKLOG.md`                      | OSS-101-04 status                                        |
| `docs/foundation/AI-CONTEXT.md`                          | Milestone roadmap                                        |
| `docs/README.md`                                         | Registry entry                                           |
| `docs/backlog/OSS-101-Plane-Integration-Backlog.md`      | OSS-101-04 complete                                      |
| `docs/architecture/APZHUB-Plane-Adapter-Design.md`       | Foundation delivered status                              |

---

## Test statistics

| Suite                        | Tests  |
| ---------------------------- | ------ |
| `plane-config.test.ts`       | 3      |
| `plane-error-mapper.test.ts` | 6      |
| `plane-bootstrap.test.ts`    | 2      |
| `plane-factory.test.ts`      | 3      |
| `plane-adapter.test.ts`      | 10     |
| **Total**                    | **24** |

All Plane API responses mocked — no live Plane instance required.

Integration SDK adapter tests: 13 (unchanged, pass with SDK defect fix).

---

## Coverage (plane package)

| Metric    | `integrations/plane/src` |
| --------- | ------------------------ |
| Lines     | 91.72%                   |
| Branches  | 73.64%                   |
| Functions | 100%                     |

---

## SDK defect resolved (documented)

**Issue:** `AdapterConnectionDefaults` omitted `headerName` (and related auth fields) while `ConnectionDefinition` requires `headerName` for `api_key_header` mode. `IntegrationAdapterBase.connect()` could not open connections for API-key-header adapters.

**Fix:** Extended `AdapterConnectionDefaults` and `adapter-base` register call. Minimal change — no behavioural change to MockAdapter.

---

## Outstanding technical debt

| Item                              | Notes                                                                |
| --------------------------------- | -------------------------------------------------------------------- |
| HTTP transport                    | `PlaneFetchClient` interim — replace with SDK transport (OSS-100-06) |
| Provisioning / entity mapping     | OSS-101-04 scope excluded; OSS-101-05+                               |
| Control plane registration        | Health-only ops console wiring deferred to OSS-101-09                |
| Retry policy execution            | Config typed; retry not applied in fetch layer yet                   |
| Extended capabilities in SDK enum | `users`, `workspaces`, `version` in metadata until SDK absorbs       |

---

## Risks

| Risk                                        | Mitigation                                                         |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Adapters duplicate SDK cross-cutting logic  | PlaneAdapter reviewed — hooks only                                 |
| Secret materialisation pattern inconsistent | Documented: AuthProvider validate + SecretProvider resolve         |
| Plane API version drift                     | Version range in manifest metadata; `discoverVersion()` at connect |
| Per-adapter fetch clients until OSS-100-06  | Documented debt; swap to SDK transport                             |

---

## Lessons learned (first production adapter)

1. **MockAdapter is sufficient for SDK patterns** but production adapters need explicit `headerName` on connection defaults for `api_key_header`.
2. **Authenticate vs resolve** — SDK auth validates; adapters must inject `SecretProvider` for credential materialisation.
3. **Extended capabilities** — metadata pattern works; SDK enum can grow without adapter restructure.
4. **Test via `fetchFn` injection** — clean contract tests without live engines.
5. **Minimal SDK fixes are justified** when first consumer exposes contract gaps — document before merging.

---

## Recommendations before Zammad adapter (OSS-102)

1. Copy `integrations/plane/` structure — config, bootstrap, error mapper, factory, internal client.
2. Reuse `createPlaneAdapter` patterns for `createZammadAdapter` with Zammad-specific auth (likely bearer token).
3. Register Zammad capabilities in manifest before CRUD work.
4. Do not begin until owner approves OSS-102 scope.
5. Prioritise OSS-100-06 HTTP transport if multiple adapters proceed in parallel — reduces duplicated fetch clients.

---

## Quality gates

| Gate                                                          | Result                                        |
| ------------------------------------------------------------- | --------------------------------------------- |
| `pnpm --filter @apzhub/integration-plane typecheck`           | Pass                                          |
| `pnpm typecheck` (monorepo)                                   | Pass                                          |
| `pnpm vitest run integrations/plane`                          | Pass — 24 tests                               |
| `pnpm vitest run packages/integration-sdk integrations/plane` | Pass — 89 tests                               |
| `pnpm eslint integrations/plane`                              | Pass                                          |
| Full `pnpm test`                                              | Not run in this session (scoped verification) |

---

## Stop condition

OSS-101-04 complete. **Do not begin OSS-101-05 or OSS-102.** Await explicit owner approval.
