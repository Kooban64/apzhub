# APZHUB API & communication quick reference

One-page lookup derived from [010](./010-api-gateway-integration-communication-standards.md).

## Philosophy

**One API** for the client — never expose which engine, connector, or number of backends served the request. The API belongs to APZHUB.

## Request path (no shortcuts)

```
Desktop Client → API Gateway → Auth → Authz → Platform Service → Connector → Engine
                              → (return) Standard Response → Client
```

Edge TLS/routing: Caddy or Nginx (004). **APZHUB API Gateway** = application boundary (no business logic).

## Gateway owns

Auth · session validation · rate limiting · request validation · routing · versioning · logging · audit hooks · correlation IDs · error/response standardisation

## API categories (client-facing vs internal)

**Client:** Identity · Platform · Module · Administration · Health · Metrics · (future AI)

**Internal only:** Service APIs · Connector APIs — never exposed to desktop client.

## Request context (explicit — no implicit state)

Auth token · correlation ID · organisation · workspace · locale · timezone · client version · feature flags (optional)

## Response envelope (consistent everywhere)

Success · payload · metadata · pagination · warnings · validation messages · correlation ID · execution time

Platform models only — no backend shapes.

## Error categories

Validation · authentication · permission · business rule · configuration · integration · connector · temporary failure · system

No backend implementation details; permission errors must not leak hidden resources.

## Validation (before business logic)

Request · schema · business · permission · dependency · connector availability

## Lists & search

**Pagination:** page/sort/filter/search — cursor later if needed.

**Filters (consistent):** date range · status · assignee · owner · department · labels · tags · priority.

**Search:** global · workspace · advanced · saved · recent — abstract engine-specific behaviour; indexing via Platform Services (009).

## Batch & files

Bulk update/delete/assign/import/export with progress events; async for long runs.

Files: central upload/download · chunked · progress · retry · audit — **never bypass platform**; S3-compatible storage (004).

## Resilience (connectors)

Timeouts · retries · max retries · circuit breaker (open/half-open/closed) · graceful failure · health monitoring

Rate limits: per user · org · API · connector · worker (Redis 004).

## Correlation ID

Propagates: gateway → services → connectors → background jobs → audit → logs — end-to-end tracing.

## Streaming (future-ready)

Notifications · AI · live logs · workflow progress · monitoring.

## External integrations (future)

M365 · Google · GitHub/GitLab · Slack · 3CX · ERP · CRM · payments · IdPs — same **connector architecture** (008).

## API principles

Predictable · typed · versioned · documented · consistent · secure · idempotent where appropriate · backward compatible · **business-oriented** names

REST-first (004).

## Security (central)

Auth · permissions · CSRF · input validation · output encoding · rate limit · audit · secure headers

## Testing & docs (mandatory)

Unit · integration · contract · security · performance · failure · Playwright (user journeys)

Docs: description · examples · validation · permissions · errors · version · change history

## Monitoring metrics

Requests · latency · errors · retries · timeouts · success rate · traffic · connector health

## Future clients (no redesign)

Desktop · mobile · CLI · AI agents · automation · public/partner APIs

## Development rules

Never expose backend APIs to client · all client traffic through gateway · consistent envelopes · validate first · capability-based API design

## Acceptance

All client requests via gateway · uniform responses · hidden backends · correlation tracing · isolated connectors · versioned documented APIs · extensible to new clients/integrations
