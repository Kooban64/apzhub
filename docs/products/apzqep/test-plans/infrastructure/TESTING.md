# Testing — APZQEP-ENG-060B

## Suites

| Suite | Coverage |
| ----- | -------- |
| Domain unit tests (unchanged) | Aggregate, lifecycle, policies, VOs |
| Architecture boundary tests | Domain purity; infra/application/presentation layering |
| In-memory repository contract | CRUD, concurrency, history, revisions |
| Postgres repository (mapper unit test) | Row mapping fidelity; executor paths compile-checked, not integration-tested |
| Application service | Permissions, full lifecycle, item management, concurrency, hooks, wildcard permissions |
| Available actions / DTO adapter | Projection correctness |

## Targets (package, `packages/qep-test-plans/src` scope)

| Metric | Result |
| ------ | ------ |
| Line / statement | **~77%** |
| Function | **~90%** |
| Branch | **~84%** |

In-memory path, application service, domain, and DTO adapter are exercised at 90–100%. Lower overall numbers are driven by the Postgres executor (integration-only paths, mocked/compile-checked per the ENG-050B precedent) and presentation-layer constant stubs (`permissions.ts`, `routes.ts`, `navigation.ts`) which carry no runtime branches to exercise absent a Workbench.

## Command

```bash
pnpm --filter @apzhub/qep-test-plans test
pnpm --filter @apzhub/qep-test-plans typecheck
```

## Result at delivery

**99 tests passed** across 8 test files; `tsc --noEmit` clean.
