# Plane Adapter (`@apzhub/integration-plane`)

**Milestone:** OSS-101-04…09 (foundation → core → tasks → collaboration → sync/events → operations/certification) + OSS-110-01 (contracts migration)  
**Package:** `integrations/plane/` **v0.6.0**  
**Integration ID:** `plane`

---

## Purpose

Production Plane CE integration adapter and **APZHUB Projects provider**. Extends `IntegrationAdapterBase` from `@apzhub/integration-sdk` v0.5.0+ and exposes strongly typed core service APIs with canonical entity mapping — including **Task**, **Comment**, **Activity**, **Watcher**, **Analytics**, **Webhooks**, **Events**, **Synchronisation**, and **Operations / Certification** capabilities. This package is the **reference adapter** for future integrations.

---

## Public API

### Adapter lifecycle

| Export | Description |
|--------|-------------|
| `PlaneAdapter` | Production adapter class |
| `createPlaneAdapter` | Factory — builds context, registers capabilities, initialises |
| `disposePlaneAdapter` | Graceful disposal via `AdapterFactory` |
| `createPlaneBootstrapConfiguration` | Manifest + connection bootstrap |

### Core services (`adapter.core`)

| Service | Access | Operations |
|---------|--------|------------|
| Workspaces | `adapter.core.workspaces` | list, get |
| Projects | `adapter.core.projects` | list, get, create, update, archive |
| Project States | `adapter.core.projectStates` | list, get, create, update, delete |
| Labels | `adapter.core.labels` | list, get, create, update, delete |
| Cycles (Sprints) | `adapter.core.cycles` | list, get, create, update, archive |
| Modules | `adapter.core.modules` | list, get, create, update, archive |
| Members | `adapter.core.members` | list, get, add, update, remove |
| **Tasks** | `adapter.core.tasks` | list, get, create, update, archive, transition, assign/labels/cycle/module |
| **Comments** | `adapter.core.comments` | list, get, create, update, delete |
| **Activity** | `adapter.core.activity` | list, listTaskActivity, listProjectActivity |
| **Watchers** | `adapter.core.watchers` | list, add, remove |
| **Analytics** | `adapter.core.analytics` | project/task stats, cycle progress, velocity, burndown |
| **Webhooks** | `adapter.core.webhooks` | list, get, create, update, delete, validate |
| **Events** | `adapter.core.events` | translate Plane payloads → canonical events |
| **Synchronisation** | `adapter.core.synchronisation` | full / incremental sync, status, resume, safe restart |
| **Operations** | `adapter.operations` | certification, compatibility, readiness, health, reports |

See [PLANE-TASK-SERVICE.md](./PLANE-TASK-SERVICE.md), [PLANE-COLLABORATION-INTELLIGENCE.md](./PLANE-COLLABORATION-INTELLIGENCE.md), [PLANE-SYNC-EVENTS.md](./PLANE-SYNC-EVENTS.md), and [PLANE-OPERATIONS.md](./PLANE-OPERATIONS.md).

### Canonical models

Canonical APZHUB DTOs live in `@apzhub/platform-service-contracts`. This package re-exports a subset for adapter consumers, including `Comment`, `ActivityEntry`, `Watcher`, `ProjectStatistics`, `VelocitySnapshot`, `BurndownSnapshot`, `WebhookRegistration`, `IntegrationEventEnvelope`, `SyncStatus`.

**Preferred import for new code:**

```typescript
import type { Task, Comment, ProjectStatistics } from "@apzhub/platform-service-contracts";
```

### Capability discovery

```typescript
adapter.core.discoverCapabilities();
// includes comments, activity, watchers, analytics, webhooks, events, synchronisation
discoverPlaneCoreServiceCapabilities();
```

Extended bootstrap capabilities include `comments`, `activity`, `watchers`, `analytics`, `events`, `webhooks`, `synchronisation`.

**Not exported:** `PlaneClient`, `PlaneRestClient`, internal API types, mappers.

### Platform service wiring

Plane adapter core services are consumed by `@apzhub/platform-services` via Plane capability providers and the mapping layer — not directly by modules. **OSS-101-09 does not change PlatformService or HTTP routes.**

```typescript
import { createPlatformServicesWithPlane } from "@apzhub/platform-services";

const { gateway } = createPlatformServicesWithPlane(adapter.core);
await gateway.projects.listProjects(serviceContext);
```

Consumers receive APZHUB global IDs only (ADR-0048). Provisional `*_plane_*` IDs remain adapter-boundary artefacts.

**OSS-101-06** added `adapter.core.tasks`. **OSS-110-08/09** wired TaskServiceImpl + `/api/v1/tasks`. **OSS-101-07** adds collaboration and intelligence on the adapter only. **OSS-101-08** adds webhooks, event translation, and synchronisation APIs on the adapter only. **OSS-101-09** certifies operations/diagnostics on the adapter only.

---

## Usage

```typescript
import { createPlaneAdapter } from "@apzhub/integration-plane";

const { adapter } = await createPlaneAdapter({
  plane: {
    baseUrl: "https://plane.example.com",
    apiBaseUrl: "https://plane.example.com",
    apiTokenRef: "plane/api-token",
    workspaceSlug: "apzhub",
  },
  tenantId: "tenant-1",
  apiToken: process.env.PLANE_API_TOKEN,
});

await adapter.initialise();
await adapter.connect({ correlationId: "corr-1", tenantId: "tenant-1" });

const ctx = { correlationId: "corr-1", tenantId: "tenant-1" };
const projectId = "proj_plane_…";
const taskId = "task_plane_…";

const comments = await adapter.core.comments.list(ctx, projectId, taskId);
const stats = await adapter.core.analytics.getProjectStatistics(ctx, projectId);
const sync = await adapter.core.synchronisation.runIncrementalSync(ctx);
const event = adapter.core.events.translate(ctx, planeWebhookPayload);
const report = await adapter.buildOperationalReport(ctx);
```

---

## Cross-cutting behaviour

| Concern | Implementation |
|---------|----------------|
| Logging | `IntegrationLogger` via `PlaneOperationRunner` |
| Metrics | SDK `IntegrationMetrics` + `MetricsProvider` |
| Errors | `PlaneVendorErrorMapper` → platform categories (incl. webhook/sync/event) |
| Resilience | SDK circuit breaker |
| Validation | Request + response validators per operation |
| Mapping | Plane records → APZHUB canonical models |
| Diagnostics | `taskCapability` + `collaborationCapability` + `syncEventsCapability` + `operationsCapability` |

Provisional IDs use `*_plane_{engineId}` until platform mapping store resolves them.

### Archive semantics

Tasks are **soft-archived** via Plane `archived_at`. Hard DELETE is not exposed on tasks.

### Out of scope (OSS-101-09)

UI, Kanban, notifications, webhook HTTP ingress, realtime (WebSockets/SSE), attachments, documents, chat, HTTP routes, PlatformService changes, schedulers, workers, platform event bus, second adapter.

---

## Configuration

See OSS-101-04 documentation — `PlaneConfiguration` with `validatePlaneConfiguration()`.

---

## Tests

99 unit/contract tests — all Plane API responses mocked (including comments, activity, watchers, analytics, webhooks, sync, events, operations/certification).

```bash
pnpm exec vitest run --config vitest.config.ts integrations/plane
```

Mock router: `createMockPlaneCoreFetch()` in `src/testing/` (supports degraded services, unsupported APIs, version differences, webhook/sync failures).

---

## Related documents

- [Plane Operations & Certification](./PLANE-OPERATIONS.md)
- [Plane Sync, Events & Production Readiness](./PLANE-SYNC-EVENTS.md)
- [Plane Collaboration & Intelligence](./PLANE-COLLABORATION-INTELLIGENCE.md)
- [Plane Task Service](./PLANE-TASK-SERVICE.md)
- [OSS-101-09 Completion Report](../../docs/sprint/OSS-101-09-completion-report.md)
- [OSS-101-08 Completion Report](../../docs/sprint/OSS-101-08-completion-report.md)
- [OSS-101-07 Completion Report](../../docs/sprint/OSS-101-07-completion-report.md)
- [OSS-101-06 Completion Report](../../docs/sprint/OSS-101-06-completion-report.md)
- [OSS-101-05 Completion Report](../../docs/sprint/OSS-101-05-completion-report.md)
- [OSS-101-04 Completion Report](../../docs/sprint/OSS-101-04-completion-report.md)
- [Plane Adapter Design](../../docs/architecture/APZHUB-Plane-Adapter-Design.md)
- [Adapter Framework](../../packages/integration-sdk/docs/ADAPTER-FRAMEWORK.md)
