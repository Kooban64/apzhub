# Authorization — Platform-1.3-ENG-003

## Authentication & session validation

1. `withPlatformApiAuth` authenticates the session (Request Pipeline entry).
2. Handler resolves permissions via `resolveSessionAuthorization` (platform-authorization — same grant boundary as ProductionAuthorizationProvider).
3. `RealtimeSubscriptionService.openSseStream` deny-by-default checks resolved permissions.
4. Optional heartbeat `validateSession` re-checks session presence / revocation hook.

## Authorization (deny-by-default)

SSE enablement: `APZHUB_REALTIME_SSE_ENABLED` must be `true`/`1`/`on`.

Stream open requires one of:

- `support.requests.read`
- `support.requests.list`
- `support.requests.get`
- `support.*`

Missing permission → 403 (`REALTIME_FORBIDDEN`) + audit `realtime.connection.denied`.

## Tenant & organisation isolation

| Scope        | Rule                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| Tenant       | Envelope `tenantId` must match connection tenant                                  |
| Organisation | If connection has `organisationId` and event has organisation id, they must match |

Cross-scope deliveries are counted (`tenantMismatches` / `organisationMismatches`) and dropped.

## Connection & rate limits

| Control              | Env                                          | Default |
| -------------------- | -------------------------------------------- | ------- |
| Global connections   | `APZHUB_REALTIME_MAX_CONNECTIONS_GLOBAL`     | 200     |
| Per-tenant           | `APZHUB_REALTIME_MAX_CONNECTIONS_PER_TENANT` | 50      |
| Per-connection queue | `APZHUB_REALTIME_MAX_QUEUE_PER_CONNECTION`   | 64      |

Capacity exceeded → 429 (`RATE_LIMITED` / `REALTIME_CAPACITY`).

## Preserved boundaries

Request Pipeline · ProductionAuthorizationProvider grant model · Platform Event Bus · Platform Service Gateway (REST mutations) · Workbench · Integration SDK 1.0.0.
