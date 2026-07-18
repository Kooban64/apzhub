# Zammad Synchronisation (`adapter.core.synchronisation`)

**Milestone:** OSS-102-06  
**Package:** `@apzhub/integration-zammad` **v0.6.0**  
**Access:** `adapter.core.synchronisation` (`ZammadSyncService`)

---

## Purpose

Production-grade **synchronisation APIs** for Support inventory (support requests, organizations, groups, users).

No scheduler. No workers. No persistence. Sync state is adapter-local (in-memory) with optional caller-held resume tokens.

```text
adapter.core.synchronisation
  → ZammadSyncService
  → ZammadOperationRunner
  → ZammadRestClient
  → /api/v1/tickets | organizations | groups | users
```

---

## Supported operations

| Method                 | Notes                                                    |
| ---------------------- | -------------------------------------------------------- |
| `runFullSync`          | Enumerate current inventory                              |
| `runIncrementalSync`   | Filter by `updated_at >= since` (caller or last success) |
| `getSyncState`         | Mode, status, stats, cursor, errors                      |
| `getLastSyncTimestamp` | Last successful sync                                     |
| `safeRestart`          | Clears stuck `running` → `idle`                          |
| `getDiagnostics`       | Health, resume/incremental/restart flags, retry counts   |

---

## Cursor / resume

Resume tokens are base64url JSON (`mode`, `since`, page markers, `recordsProcessed`).  
On failure, a resume token is stored in `SyncStatus.cursor.resumeToken`.  
Success clears the resume token and records `lastSuccessfulSyncAt`.

---

## Metrics

- `zammad.sync.duration_ms`
- `zammad.sync.throughput`
- `zammad.sync.failures`
- `zammad.sync.retries`
- `zammad.provider.latency_ms`

---

## Exclusions

No PlatformService · No workers · No schedulers · No persistence · No Event Bus

---

## SDK polling wrapper (OSS-100-08)

`createZammadPollingSource(syncService)` wraps this service as SDK `PollingSource` (`createPollingSourceFromSync`). One sync run maps to a single exhausted page. Callers may use `PollingExecutionPipeline` + checkpoint ack; the SDK does **not** schedule runs.

See [POLLING-CONTRACTS.md](../../packages/integration-sdk/docs/POLLING-CONTRACTS.md) · [WEBHOOK-POLLING-MIGRATION.md](../../packages/integration-sdk/docs/WEBHOOK-POLLING-MIGRATION.md).

---

## Related

- [ZAMMAD-EVENTS.md](./ZAMMAD-EVENTS.md)
- [ZAMMAD-WEBHOOKS.md](./ZAMMAD-WEBHOOKS.md)
- [OSS-102-06 Completion Report](../../docs/sprint/OSS-102-06-completion-report.md)
- [OSS-100-08 Completion Report](../../docs/sprint/OSS-100-08-completion-report.md)
