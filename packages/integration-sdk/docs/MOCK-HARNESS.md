# Mock Harness (OSS-100-09)

**Package:** `@apzhub/integration-sdk` v0.9.0  
**Export:** `@apzhub/integration-sdk/harness`  
**Primary API:** `AdapterMockHarness` · `createAdapterMockHarness`

---

## Overview

`AdapterMockHarness` is a **provider simulator** built on `createMockTransport` and `MockAdapter`. It scripts HTTP behaviours and event/polling fixtures for adapter development and certification tests without a live engine.

```text
AdapterMockHarness
        ├── MockTransportClient     — enqueue scripted HTTP responses
        ├── MockAdapter (optional)  — boot via AdapterFactory
        └── Event mocks             — polling pages, webhook payload/pipeline pieces
```

---

## HTTP simulation

| Method                                      | Behaviour                                           |
| ------------------------------------------- | --------------------------------------------------- |
| `scriptHttp(path, response, method?)`       | Enqueue one scripted response                       |
| `scriptSequence(path, responses, method?)`  | Enqueue ordered responses                           |
| `simulateHttp(path, init?)`                 | Execute request; returns `{ response, durationMs }` |
| `simulateTimeout(path)`                     | Timeout script                                      |
| `simulateError(path, status?, body?)`       | Error status (default 500)                          |
| `simulateAuthFailure(path)`                 | 401                                                 |
| `simulateRateLimit(path, retryAfterSec?)`   | 429 + `retry-after`                                 |
| `simulateRedirect(path, redirectTo)`        | 302                                                 |
| `simulateStreamPlaceholder(path)`           | Stream placeholder body                             |
| `simulatePagination(path, pages)`           | Multi-page `{ items, nextCursor }`                  |
| `simulateRetryThenSuccess(path, failures?)` | N×503 then 200                                      |

Script keys are `${METHOD} ${path}` (method uppercased).

---

## Adapter & event helpers

```typescript
import { createAdapterMockHarness } from "@apzhub/integration-sdk/harness";

const mock = createAdapterMockHarness();
mock.simulateAuthFailure("/api/v1/projects");
const { response } = await mock.simulateHttp("/api/v1/projects");

const adapter = await mock.bootAdapter();
await mock.simulateAdapterOperation(context, "listProjects", true);

const polling = mock.createPollingPages([10, 5, 0]);
const event = mock.createWebhookPayload({ action: "updated" });
const { decoder, translator } = mock.createWebhookPipelinePieces();

await mock.cleanup();
```

`createPollingPages` wraps `createMockPollingSource` with opaque cursors. Webhook helpers wrap OSS-100-08 event mocks (`createMockSourceEvent`, JSON decoder, translator).

---

## Options

| Option           | Default                       | Role                            |
| ---------------- | ----------------------------- | ------------------------------- |
| `transport`      | `{}`                          | Passed to `createMockTransport` |
| `configuration`  | `createMockAdapterManifest()` | Mock adapter bootstrap          |
| `autoInitialise` | `true`                        | Initialise on boot              |

---

## Relationship to AdapterHarness

| Harness              | Focus                                                            |
| -------------------- | ---------------------------------------------------------------- |
| `AdapterHarness`     | Lifecycle of a booted `MockAdapter` + fixtures                   |
| `AdapterMockHarness` | Transport scripting + event simulation (+ optional mock adapter) |

Use both together in richer tests: mock transport for HTTP, adapter harness for lifecycle assertions.

---

## Exclusions

- Not a live vendor API
- Does not start HTTP servers or ingress routes
- Does not publish to Event Bus
- Does not replace vendor-specific mock APIs under `integrations/*/src/testing/`

---

## Related

- [ADAPTER-HARNESS.md](./ADAPTER-HARNESS.md)
- [CONTRACT-TESTS.md](./CONTRACT-TESTS.md)
- [HTTP-TRANSPORT.md](./HTTP-TRANSPORT.md) (`createMockTransport`)
- [EVENT-ENVELOPE.md](./EVENT-ENVELOPE.md) (event mocks)
