# SPR-006 — Event Bus Delivery Semantics

> **Story:** EN-004  
> **Status:** Documented (in-process only implemented)  
> **Authority:** [ADR-0031](../adr/ADR-0031-event-registry-and-bus.md)

---

## SPR-006 delivery model

**InProcessEventBus** provides **in-process, best-effort delivery**:

| Property             | SPR-006 behaviour                                                      |
| -------------------- | ---------------------------------------------------------------------- |
| Transport            | Same Node.js process                                                   |
| Ordering             | Invocation order among matching subscribers; no cross-process ordering |
| Durability           | None — events lost on process exit                                     |
| Retry                | None                                                                   |
| Dead-letter          | None                                                                   |
| At-least-once        | Not guaranteed (single dispatch attempt per subscriber)                |
| Subscriber isolation | Yes — one handler failure does not block others                        |

Dispatch is **synchronous from the caller's perspective**: `publish()` returns after invoking handlers. Async handlers are invoked without awaiting completion; rejections increment diagnostics asynchronously.

---

## Validation gate

No subscriber receives an envelope that fails registry or envelope validation. This is **fail-fast** before dispatch — consistent with ADR-0013 spirit.

---

## Future delivery options (not implemented)

The following are documented for M7/M10 extension via `EventBusTransport`:

| Option                | Use case                                             |
| --------------------- | ---------------------------------------------------- |
| **Durable queue**     | Survive process restarts; horizontal scale consumers |
| **Outbox pattern**    | Atomic write + publish with database transactions    |
| **Retry**             | Transient subscriber or transport failures           |
| **Dead-letter queue** | Poison messages after max retries                    |
| **Webhook bridge**    | External system integration boundaries               |

`EventBusTransport` interface stub exists at `src/event/event-bus-transport.ts` — no adapter wired in SPR-006.

---

## When to upgrade transport

| Signal                          | Action                               |
| ------------------------------- | ------------------------------------ |
| Cross-service event consumption | External broker adapter              |
| Audit/legal retention required  | Durable store + outbox (M7 Activity) |
| High fan-out with backpressure  | Queue + worker pool                  |
| Integration partners            | Webhook bridge with signing          |

Until then, in-process dispatch satisfies platform bootstrap, notification mapping, and Action audit hook (EN-014) within a single server runtime.

---

## Notification boundary

Delivery semantics apply to **Event Bus subscribers only**. Notification delivery (in-app, email, push) is a separate concern handled by the Notification Framework after mappers consume bus events.

---

_SPR-006 Event Bus Delivery Semantics — EN-004._
