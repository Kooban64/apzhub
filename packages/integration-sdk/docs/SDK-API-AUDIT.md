# Integration SDK — Public API Audit

> **Milestone:** OSS-100-10  
> **Package:** `@apzhub/integration-sdk` **0.9.0**  
> **Date:** 2026-07-12  
> **Source:** [sdk-v1-audit-notes.md](../../../docs/architecture/sdk-v1-audit-notes.md)  
> **Companion:** [SDK-PUBLIC-API.md](./SDK-PUBLIC-API.md) · [SDK-V1-CERTIFICATION.md](./SDK-V1-CERTIFICATION.md)

---

## Purpose

Classify the public surface of `@apzhub/integration-sdk` for v1.0 readiness: **stable**, **internal**, **experimental**, **deprecated**, and **test-only**. Counts are approximate; root re-exports overlap subpaths.

---

## Inventory method

Parsed `export { … }` / `export type { … }` / `export const|function|class|type|interface` from root and each subpath index (observability via `export *` follow-through).

---

## Subpath symbol counts (approximate)

| Surface                                 | Symbol count (approx.) |
| --------------------------------------- | ---------------------- |
| Root `@apzhub/integration-sdk`          | **581**                |
| `./client`                              | 11                     |
| `./adapter`                             | 35                     |
| `./diagnostics`                         | 21                     |
| `./lifecycle`                           | 25                     |
| `./errors`                              | 42                     |
| `./auth`                                | 34                     |
| `./connection`                          | 26                     |
| `./health`                              | 10                     |
| `./version`                             | 7                      |
| `./resilience`                          | 14                     |
| `./observability` (resolved `export *`) | **32**                 |
| `./transport`                           | 90                     |
| `./mapping`                             | 88                     |
| `./events`                              | 87                     |
| `./harness`                             | 94                     |

---

## Classification summary

Heuristic classification across root + all subpaths (includes double-count of root re-exports):

| Class                                    | Count (summed) | Guidance                                     |
| ---------------------------------------- | -------------- | -------------------------------------------- |
| **stable**                               | ~1079          | Keep; freeze for 1.0                         |
| **stable-test** (`Mock*`, `createMock*`) | ~31            | Document as **test utilities**               |
| **test-only** (`InMemory*`, `Noop*`)     | ~30            | Document **not production SoR**              |
| **experimental** (`Placeholder*`)        | ~21            | Document experimental / pre-1.0 placeholders |
| **internal-flag**                        | **4**          | See flags below                              |
| **deprecated**                           | **0**          | —                                            |

---

## Classification definitions

| Class            | Meaning for consumers                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| **stable**       | Intended public contract for adapter authors; freeze candidate for v1.0.0                        |
| **stable-test**  | Public test helpers (`Mock*`, `createMock*`) — supported for tests, not runtime production paths |
| **test-only**    | `InMemory*` / `Noop*` fixtures — **not** durable platform stores                                 |
| **experimental** | `Placeholder*` family — retained for backward compat; not production implementations             |
| **internal**     | Not advertised for external consumption; may change without 1.0 semver commitment when promoted  |
| **deprecated**   | None identified in this audit                                                                    |

---

## Flags / recommendations (do not break APIs)

| Symbol                                                                                                                                                                                                          | Location                                  | Recommendation                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PlaneIdentityMapper`                                                                                                                                                                                           | `mapping` + root                          | Vendor convenience alias in SDK — **document as stable helper** or consider relocating to Plane adapter before strict 1.0 freeze (hide-before-v1.0 **optional**) |
| `ZammadIdentityMapper`                                                                                                                                                                                          | `mapping` + root                          | Same as above for Zammad                                                                                                                                         |
| `Placeholder*` family                                                                                                                                                                                           | adapter/client/diagnostics/auth/transport | Classify **experimental**; retain for backward compat                                                                                                            |
| `InMemoryEventDeduplicationStore`, `InMemoryReplayStore`, `InMemoryPollingCheckpointStore`, `InMemorySecretProvider`, `InMemoryConnectionRegistry`, `InMemoryMappingRegistry`, `InMemoryCapabilityRegistration` | various                                   | **Test-only / non-durable** — harness/fixtures, not platform SoR                                                                                                 |
| Large root barrel (581)                                                                                                                                                                                         | `src/index.ts`                            | Before 1.0: publish a **stable API matrix**; prefer subpath imports for new consumers                                                                            |

**No accidental deep-internal exports found that must be hidden as a certification blocker.** Surface is large but intentional for adapter authors.

---

## Exports map

```text
. | ./client | ./adapter | ./diagnostics | ./lifecycle | ./errors
./auth | ./connection | ./health | ./version | ./resilience
./observability | ./transport | ./mapping | ./events | ./harness
```

All point at `./src/**/index.ts` (source exports; private workspace package).

---

## Audit verdict

| Criterion                                | Result                                            |
| ---------------------------------------- | ------------------------------------------------- |
| Accidental must-hide internals           | **None** (no blocker)                             |
| Deprecated surface                       | **0**                                             |
| Experimental / test-only clearly present | Documented                                        |
| Root barrel size                         | Large — prefer subpaths (limitation, not blocker) |
| Ready for owner API freeze               | **Yes**, pending stable API matrix polish (R2)    |

See [SDK-PUBLIC-API.md](./SDK-PUBLIC-API.md) for consumer guidance.
