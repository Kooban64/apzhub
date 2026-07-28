# Client Connection — Platform-1.3-ENG-003

## Endpoint

Primary product URL: `GET /api/v1/support/events/stream`  
Platform URL: `GET /api/v1/realtime/stream`

## Browser client

`EventSource` with `withCredentials: true` (session cookie).  
Hook: `apps/web/lib/support/realtime/use-support-realtime.ts`.

## Lifecycle

1. Connect → `realtime.ready`
2. Optional resume via `Last-Event-ID` header or `?lastEventId=`
3. Receive wire events → invalidate TanStack Query lists/detail/articles
4. `realtime.heartbeat` keep-alive (no cache invalidation)
5. On error / idle / shutdown → close → exponential backoff reconnect (max 30s), preserving Last-Event-ID
6. Unmount → cancel timers + close EventSource

## Last-Event-ID

Server maintains a per-tenant ring buffer (`APZHUB_REALTIME_REPLAY_BUFFER_SIZE`).  
Resume is **exclusive** of the cursor id (replay prevention).  
Client passes `lastEventId` query param when recreating `EventSource` after errors.

## Mutations

Clients **must not** mutate over SSE. All writes remain REST through the Platform Service Gateway.
