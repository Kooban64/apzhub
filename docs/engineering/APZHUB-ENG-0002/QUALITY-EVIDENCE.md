# APZHUB-ENG-0002 — Quality Evidence

> **Programme:** APZHUB-ENG-0002  
> **Date:** 2026-07-20  
> **Scope:** R12-PERSIST-02 only

---

## Commands executed

| Gate                  | Command                                                        | Result              |
| --------------------- | -------------------------------------------------------------- | ------------------- |
| Typecheck             | `pnpm --filter @apzhub/activity-timeline-framework typecheck`  | **PASS**            |
| Typecheck             | `pnpm --filter @apzhub/event-notification-framework typecheck` | **PASS**            |
| Typecheck             | `pnpm exec tsc --noEmit -p apps/law-platform/tsconfig.json`    | **PASS**            |
| Unit / integration    | vitest postgres snapshot + boundary + OBS-LAW-02 regression    | **PASS** (10 tests) |
| Architecture boundary | migrations **0063/0064** present; dual-write API path          | **PASS**            |
| Compatibility         | Sync ENF/ATF store APIs preserved; OBS-LAW-02 regression green | **PASS**            |

---

## Test coverage (this programme)

| Suite                                            | Focus                                             |
| ------------------------------------------------ | ------------------------------------------------- |
| `postgres-activity-session-snapshot.test.ts`     | Mocked Postgres upsert/hydrate + production guard |
| `postgres-notification-session-snapshot.test.ts` | Same for notifications                            |
| `r12-persist-02-boundary.test.ts`                | Migrations + dual-write → API                     |
| `obs-law-02-persistence.regression.test.ts`      | Prior Law session durability regression           |

---

## Architecture verification

| Rule                                            | Evidence                                           |
| ----------------------------------------------- | -------------------------------------------------- |
| Platform-owned session SoR                      | Tables under `platform_law_*`; adapters in ATF/ENF |
| No Law-owned parallel notify/activity subsystem | Composition still uses ENF/ATF stores              |
| Sync public store API                           | Unchanged interfaces                               |
| No STOP leakage                                 | No Email / FIN / Execute                           |
