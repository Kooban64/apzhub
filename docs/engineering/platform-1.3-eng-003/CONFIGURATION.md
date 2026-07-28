# Configuration — Platform-1.3-ENG-003

| Variable                                     | Default              | Purpose                                  |
| -------------------------------------------- | -------------------- | ---------------------------------------- |
| `APZHUB_REALTIME_SSE_ENABLED`                | unset = **disabled** | Feature flag (deny-by-default)           |
| `APZHUB_REALTIME_MAX_CONNECTIONS_GLOBAL`     | 200                  | Global SSE capacity                      |
| `APZHUB_REALTIME_MAX_CONNECTIONS_PER_TENANT` | 50                   | Per-tenant cap                           |
| `APZHUB_REALTIME_MAX_QUEUE_PER_CONNECTION`   | 64                   | Back-pressure queue depth                |
| `APZHUB_REALTIME_REPLAY_BUFFER_SIZE`         | 100                  | Last-Event-ID ring buffer per tenant     |
| `APZHUB_REALTIME_IDLE_TIMEOUT_MS`            | 120000               | No business wire events → disconnect     |
| `APZHUB_REALTIME_MAX_CONNECTION_MS`          | 1800000              | Max connection lifetime → reconnect      |
| `APZHUB_REALTIME_DUPLICATE_WINDOW`           | 2000                 | Ingest / delivered id suppression window |

Documented in `.env.example` / `.env.production.example`.
