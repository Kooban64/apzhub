# Zammad Implementation Plan (OSS-102)

> **Purpose:** Implementation roadmap following the certified Reference Adapter Standard — **design only**  
> **Audience:** Engineers, owners, AI agents  
> **Authoritative references:** [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md) · [ZAMMAD-ARCHITECTURE](./ZAMMAD-ARCHITECTURE.md) · [ZAMMAD-MAPPING](./ZAMMAD-MAPPING.md) · [ZAMMAD-CAPABILITY-MATRIX](./ZAMMAD-CAPABILITY-MATRIX.md) · [ZAMMAD-TEST-PLAN](./ZAMMAD-TEST-PLAN.md)  
> **Status:** Approved discovery plan — **no code in OSS-102-01**  
> **Last updated:** 2026-07-10  
> **Milestone:** OSS-102-01

---

## 1. Compliance statement

Wave 2 **must** follow [REFERENCE-ADAPTER-STANDARD.md](./REFERENCE-ADAPTER-STANDARD.md) with **no deviations** unless an ADR + owner approval is recorded.

Plane (`@apzhub/integration-plane`) is the reference implementation to mirror structurally — not to copy Plane domain types into Support.

---

## 2. Target package structure

```text
integrations/zammad/
  integration.yaml
  package.json                 # @apzhub/integration-zammad
  tsconfig.json
  docs/
    ZAMMAD-ADAPTER.md
    ZAMMAD-SUPPORT-SERVICE.md  # when ticket services land
    ZAMMAD-SYNC-EVENTS.md
    ZAMMAD-OPERATIONS.md
  src/
    index.ts
    zammad-adapter.ts          # extends IntegrationAdapterBase
    zammad-factory.ts
    zammad-bootstrap.ts
    zammad-config.ts
    zammad-error-mapper.ts
    capabilities/
    services/                  # tickets, articles, orgs, groups, …
    mappers/
    models/
    internal/                  # ZammadRestClient — never exported
    operations/                # late milestone
    events/
    testing/                   # MockZammadApi
    validation/
```

### Related platform packages (later milestones — not OSS-102-01)

| Package                              | Role                                                   |
| ------------------------------------ | ------------------------------------------------------ |
| `@apzhub/platform-service-contracts` | `SupportService` interfaces + DTOs                     |
| `@apzhub/platform-services`          | `SupportServiceImpl`, Zammad providers, gateway wiring |
| `apps/web` `/api/v1/support…`        | HTTP surface (separate approval)                       |
| `modules/support/`                   | UI module (explicitly excluded until approved)         |

---

## 3. Dependency rules (copy from standard)

1. Adapter ↛ `platform-services`
2. Adapter ↛ MappingStore
3. HTTP handlers ↛ adapter (bootstrap dynamic import only)
4. REST client package-private
5. Contracts ↛ runtime packages
6. Extend `scripts/wave1-dependency-audit.mjs` → vendor-neutral / Zammad rules in a later milestone

---

## 4. Provider design (interfaces only — no implementation)

Providers live in platform-services (implementations) against contracts. Adapter exposes domain services; providers call adapter public API.

| Provider                    | Responsibility                                                      |
| --------------------------- | ------------------------------------------------------------------- |
| `SupportTicketProvider`     | List/get/create/update/transition tickets                           |
| `SupportCommentProvider`    | Articles as comments/notes                                          |
| `SupportAttachmentProvider` | Upload metadata + download orchestration                            |
| `OrganisationProvider`      | Organizations CRUD/list/search                                      |
| `SupportTeamProvider`       | Groups as support teams/queues                                      |
| `SupportUserProvider`       | Agent/customer user projection + mapping hooks                      |
| `SupportTagProvider`        | Tag add/remove/list                                                 |
| `SupportStatusProvider`     | State catalogue projection                                          |
| `SupportPriorityProvider`   | Priority catalogue projection                                       |
| `SupportSearchProvider`     | Optional engine search (bootstrap)                                  |
| `SupportAnalyticsProvider`  | Optional counts / SLA stats                                         |
| `SupportSyncProvider`       | Full/incremental sync operations                                    |
| `SupportWebhookProvider`    | Register/list engine webhooks if API allows; else config-documented |
| `SupportEventTranslator`    | Zammad webhook/payload → canonical events                           |

**Naming note:** Prefer `Support*` over `Zammad*` in platform contracts. Adapter package remains `integration-zammad`.

### Example contract sketch (non-normative)

```typescript
interface SupportTicketProvider {
  list(
    ctx: ServiceRequestContext,
    query: SupportTicketListQuery,
  ): Promise<SupportTicketListResult>;
  get(ctx: ServiceRequestContext, id: SupportTicketId): Promise<SupportTicket>;
  create(
    ctx: ServiceRequestContext,
    input: CreateSupportTicketInput,
  ): Promise<SupportTicket>;
  update(
    ctx: ServiceRequestContext,
    id: SupportTicketId,
    input: UpdateSupportTicketInput,
  ): Promise<SupportTicket>;
}
```

---

## 5. Mapping strategy

| Concern       | Owner                                        | Approach                                                                                              |
| ------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Global IDs    | Platform                                     | Generate `sreq_` / related prefixes (ADR in contracts milestone)                                      |
| Provider IDs  | Adapter                                      | Zammad integer IDs only inside adapter                                                                |
| Persistence   | `EntityMappingStore`                         | Platform PostgreSQL; tenant-scoped                                                                    |
| Relationships | Platform Services                            | Resolve mapped IDs before/after adapter calls                                                         |
| Sync          | Adapter sync service + platform jobs (later) | Incremental cursors; idempotent upserts                                                               |
| Conflicts     | Platform Services                            | Last-write-wins with updated_at compare; audit on conflict; no silent clobber of platform-only fields |
| Deletes       | Platform Services                            | Soft-delete/archive policy; Zammad hard delete requires admin + explicit op                           |

### Sync modes

1. **Write-through** mutations for interactive Support API
2. **Incremental sync** for webhook gaps / reconciliation
3. **Full sync** for bootstrap / disaster recovery (rate-limited)

---

## 6. Recommended milestones

| Milestone      | Scope                                                                    | Code?                                      |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| **OSS-102-01** | Discovery & architecture (this doc set)                                  | **No**                                     |
| **OSS-102-02** | Environment, version pin, ADR(s), secrets inventory                      | Docs + config samples only unless approved |
| **OSS-102-03** | `integration.yaml` + Support `service.yaml` manifests                    | Manifests only                             |
| **OSS-102-04** | Adapter scaffold: factory, config, auth, error mapper, mock API skeleton | Yes — scaffold                             |
| **OSS-102-05** | Core: orgs, groups, users, tickets                                       | Yes                                        |
| **OSS-102-06** | Articles, attachments, tags, states, priorities                          | Yes                                        |
| **OSS-102-07** | Platform contracts + SupportServiceImpl + providers + mapping            | Yes (platform)                             |
| **OSS-102-08** | Sync, events, webhooks (adapter); no ingress unless approved             | Yes                                        |
| **OSS-102-09** | Operations, diagnostics, certification                                   | Yes                                        |
| **OSS-102-10** | Wave 2 certification & closeout                                          | Tests + docs                               |

Parallel platform HTTP (`/api/v1/support…`) and Support UI require **separate owner approval** (mirror OSS-110 / module tracks).

---

## 7. Auth & connection design

- Default: API token via SDK AuthenticationProvider
- Optional: OAuth2 client credentials / bearer for future
- Connection: base URL, TLS, timeout, rate limit, circuit breaker from SDK
- Probe: `GET /api/v1/users/me` + version detection endpoint/header if available

---

## 8. Error translation

Map Zammad HTTP statuses and error bodies to Integration SDK error categories:

| Zammad / HTTP      | Platform category (illustrative)                 |
| ------------------ | ------------------------------------------------ |
| 401 / 403          | AUTH / FORBIDDEN                                 |
| 404                | NOT_FOUND                                        |
| 422 / validation   | VALIDATION                                       |
| 429                | RATE_LIMITED                                     |
| 5xx                | PROVIDER_UNAVAILABLE                             |
| ACL miss on ticket | NOT_FOUND or FORBIDDEN (fail closed; no leakage) |

---

## 9. Observability

- Metrics: request count, latency, error rate, sync lag
- Logs: structured, correlation ID, no secrets/PII bodies by default
- Diagnostics: adapter version, SDK version, CE version, capability matrix, CB state

---

## 10. Explicit non-goals (until approved)

- Production code in OSS-102-01
- Support UI / Workbench module
- Webhook HTTP ingress
- Platform Event Bus ownership
- GraphQL
- Enterprise-only features
- Changes to Plane / Projects

---

## Related

- [ZAMMAD-TEST-PLAN.md](./ZAMMAD-TEST-PLAN.md)
- [OSS-102-01 Completion Report](../sprint/OSS-102-01-completion-report.md)
