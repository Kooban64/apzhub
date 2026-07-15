# Polling Contracts (OSS-100-08)

**Package:** `@apzhub/integration-sdk` v0.8.0  
**Export:** `@apzhub/integration-sdk/events`  
**Related ADR:** [ADR-0056](../../../docs/adr/ADR-0056-adapter-polling-vs-platform-scheduling.md)

---

## Purpose

Vendor-neutral **polling source** contract for adapters. Exposes page-oriented pull of provider changes. The SDK execution pipeline applies limits and proposes checkpoints. **No workers or schedulers** in the SDK — platform owns when to call `poll` / `execute`.

```text
Platform scheduler (future) ──► PollingExecutionPipeline.execute
                                        ↓
                                 PollingSource.poll (adapter)
                                        ↓
                                 vendor list/sync APIs
```

---

## Modes

| `PollingMode` | Intent                                                      |
| ------------- | ----------------------------------------------------------- |
| `full`        | Full inventory / baseline                                   |
| `incremental` | Changes since cursor / `since`                              |
| `resume`      | Continue after interruption (typically maps to incremental) |
| `validation`  | Dry-run / capability probe                                  |

`POLLING_MODES` / `isPollingMode`.

---

## `PollingSource`

```typescript
interface PollingSource {
  readonly definition: PollingSourceDefinition;
  poll(
    context: IntegrationRequestContext,
    request: PollingPageRequest,
  ): Promise<PollingPageResult>;
}
```

| Type                      | Fields                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `PollingSourceDefinition` | `id`, `integrationId`, `providerId`, `resourceTypes`, `supportedModes`, optional page sizes |
| `PollingPageRequest`      | `mode`, optional `cursor`, `pageSize`, `since`, `signal`                                    |
| `PollingPageResult`       | `records`, optional `events`, `nextCursor`, `exhausted`, `pageToken`, `recordsProcessed`    |

---

## Execution pipeline

`DefaultPollingExecutionPipeline` / `createPollingExecutionPipeline`:

1. Loop `source.poll` until exhausted, cancelled, stalled, or limit hit
2. Aggregate records / events
3. **Propose** checkpoint when store present and `requireCheckpointAck !== false`
4. Return `PollingExecutionResult` — caller must **ack/commit** checkpoint separately

Default policy limits:

| Limit                  | Default |
| ---------------------- | ------- |
| `maxPages`             | 100     |
| `maxRecords`           | 10_000  |
| `maxDurationMs`        | 60_000  |
| `maxDuplicatePages`    | 2       |
| `requireCheckpointAck` | `true`  |

Stall detection: repeated identical `pageToken`, or unchanged cursor with empty non-exhausted page.

Outcomes: `completed` | `partial` | `cancelled` | `stalled` | `limit_exceeded` | `failed`.

---

## Sync-service bridge

```typescript
import { createPollingSourceFromSync } from "@apzhub/integration-sdk/events";

const source = createPollingSourceFromSync({
  definition: {/* … */},
  syncService, // runFullSync / runIncrementalSync / getSyncState
});
```

One sync run → single exhausted page (batch-oriented adapters). Plane/Zammad use this via `createPlanePollingSource` / `createZammadPollingSource`.

---

## Capability declaration

```typescript
declarePollingCapability({
  modes: ["full", "incremental", "resume", "validation"],
  supportsCheckpoints: true,
  supportsResume: true,
  supportsIncremental: true,
});
```

---

## Explicit absences

| Concern                          | Status                              |
| -------------------------------- | ----------------------------------- |
| Workers / cron / schedulers      | **Absent** (ADR-0056)               |
| Auto-commit of checkpoints       | **Absent** — propose only until ack |
| Platform Event Bus               | **Absent**                          |
| Durable production checkpoint DB | **Absent** — in-memory for tests    |

---

## Related

- [POLLING-CURSORS.md](./POLLING-CURSORS.md)
- [POLLING-CHECKPOINTS.md](./POLLING-CHECKPOINTS.md)
- [WEBHOOK-POLLING-MIGRATION.md](./WEBHOOK-POLLING-MIGRATION.md)
- [EVENT-ENVELOPE.md](./EVENT-ENVELOPE.md)
