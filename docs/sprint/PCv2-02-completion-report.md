# PCv2-02 Completion Report — Outbox Workers & Event Replay

> **Status:** COMPLETE  
> **Package:** `@apzhub/platform-outbox` **0.1.0**  
> **Date:** 2026-07-18  
> **Classification:** Platform Core MVP — production-safe outbox drain

---

## Executive summary

PCv2-02 delivers the platform outbox worker MVP that drains durable `law_outbox_event` rows (including trust aggregates) with claim → handler → published / retry / dead-letter lifecycle, plus replay. Patterns reuse Search journal concepts without modifying frozen Search packages. HTTP request handlers do not perform drains.

---

## Deliverables

| Item         | Path / command                                                |
| ------------ | ------------------------------------------------------------- |
| Package      | `packages/platform-outbox/` **0.1.0**                         |
| Migration    | `packages/config/drizzle/0060_apz_platform_outbox_worker.sql` |
| Schema       | `lawOutboxEvent` lifecycle columns in `legal-schema.ts`       |
| Worker entry | `pnpm worker:outbox` / `pnpm worker:outbox --once`            |
| Audit        | `pnpm audit:platform-outbox` **PASS**                         |
| Sprint guide | `docs/sprint/PCv2-02-Outbox-Workers-Sprint-Guide.md`          |
| Unit tests   | **7** passed                                                  |

---

## Architecture

```text
Mutation TX → law_outbox_event (pending)
    → OutboxWorker.processBatch()  [scripts/worker-outbox.mjs]
    → OutboxHandler(s)  [default: acknowledging]
    → published | retrying | dead-letter
Replay: dead-letter|failed|published → pending
```

---

## Debt addressed

| Ref    | Result                        |
| ------ | ----------------------------- |
| TD-P18 | Outbox worker MVP             |
| TD-P19 | Replay API                    |
| TD-P20 | Dead-letter path              |
| TD-T07 | Trust events share drain path |

---

## Explicit limitations (retained)

- Default handler acknowledges only (no ENF durable relay / webhook fan-out yet)
- No BullMQ / PCv2-08 job registry / admin UI
- Postgres claim is optimistic update (not `SKIP LOCKED` yet)
- Worker requires `DATABASE_URL` for live drain

---

## Quality

| Gate                                              | Result       |
| ------------------------------------------------- | ------------ |
| `pnpm --filter @apzhub/platform-outbox typecheck` | PASS         |
| `pnpm --filter @apzhub/platform-outbox test`      | **7** passed |
| `pnpm audit:platform-outbox`                      | PASS         |

---

## Stop condition

**COMPLETE.** Await explicit owner approval before the next programme.

---

## See also

- [Sprint Guide](./PCv2-02-Outbox-Workers-Sprint-Guide.md)
- [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)
- [Platform Core v2 Roadmap](../roadmap/APZHUB-Platform-Core-v2-Roadmap.md)
