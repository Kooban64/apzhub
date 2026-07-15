# Polling Cursors (OSS-100-08)

**Package:** `@apzhub/integration-sdk` v0.8.0  
**Export:** `@apzhub/integration-sdk/events`

---

## Purpose

Opaque, typed cursor values that adapters encode with provider-specific state. The SDK does not interpret vendor pagination internals beyond kind helpers and equality checks.

---

## Cursor kinds

| `PollingCursorKind` | Helper                  | Typical use                               |
| ------------------- | ----------------------- | ----------------------------------------- |
| `opaque`            | `createOpaqueCursor`    | Resume tokens / opaque blobs              |
| `timestamp`         | `createTimestampCursor` | `updated_at` watermarks                   |
| `offset`            | `createOffsetCursor`    | Numeric offsets                           |
| `page`              | `createPageCursor`      | Page numbers                              |
| `composite`         | `createCompositeCursor` | Multi-resource map (base64url JSON value) |
| `provider`          | `createProviderCursor`  | Vendor-native token                       |

```typescript
interface PollingCursor {
  readonly kind: PollingCursorKind;
  readonly value: string;
  readonly resourceCursors?: Readonly<Record<string, string>>;
  readonly resumeToken?: string;
  readonly lastSyncAt?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}
```

`cursorsEqual(a, b)` — compares `kind` + `value` only (used for stall detection).

---

## Legacy SyncCursor bridge

Compatible with `@apzhub/platform-service-contracts` sync cursor shape:

```typescript
fromSyncCursor(legacy); // → PollingCursor
toSyncCursor(cursor); // → LegacySyncCursor
wrapSyncCursorAsPollingCursor / unwrapPollingCursorAsSyncCursor;
```

Mapping:

| Legacy field             | PollingCursor                 |
| ------------------------ | ----------------------------- |
| `resumeToken`            | `kind: opaque`, value = token |
| `lastSyncAt` (no resume) | `kind: timestamp`             |
| `resourceCursors` only   | `kind: composite`             |

---

## Security

- Cursor `metadata` must stay non-secret
- Do not embed API tokens or credentials in cursor values
- Prefer opaque provider tokens over logging full request filters

---

## Related

- [POLLING-CONTRACTS.md](./POLLING-CONTRACTS.md)
- [POLLING-CHECKPOINTS.md](./POLLING-CHECKPOINTS.md)
- [WEBHOOK-POLLING-MIGRATION.md](./WEBHOOK-POLLING-MIGRATION.md)
