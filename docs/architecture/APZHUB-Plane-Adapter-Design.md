# APZHUB Plane Adapter Design

**Milestone:** OSS-101  
**Status:** OSS-101-09 operations/diagnostics/certification delivered — Plane is the reference adapter; further milestones await owner approval
**Authority:** [Adapter Boundary Pattern](./APZHUB-Adapter-Boundary-Pattern.md) · [Integration SDK 026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md)

---

## Purpose

Define the `PlaneAdapter` integration boundary — the only component permitted to call Plane CE APIs.

**Integration ID:** `plane`  
**Planned location:** `integrations/plane/`  
**Manifest:** `integration.yaml` (required before code)

---

## Adapter responsibilities checklist

| Responsibility | Plane-specific design |
|----------------|-------------------------|
| **Connection configuration** | `PLANE_BASE_URL`, timeout, API version pin; per-tenant workspace slug ref in config |
| **Authentication bridge** | Service token per tenant workspace; optional user-scoped token for attributed actions |
| **Provisioning bridge** | Create Plane workspace on tenant enable; default project templates optional |
| **User mapping** | Platform user ID ↔ Plane user ID; JIT create Plane user on first project access |
| **Permission mapping** | APZHUB permission set → Plane project role assignment API |
| **Entity mapping** | Persistent map: project, task, sprint, module, label IDs |
| **Health check** | `GET /api/health/` or workspace list probe; version header capture |
| **Diagnostics** | Last sync, error counts, latency, engine version — no tokens in output |
| **Lifecycle participation** | Pause sync on maintenance; resume on recovery |
| **Error translation** | Plane 4xx/5xx → platform typed errors (NOT_FOUND, FORBIDDEN, CONFLICT, UNAVAILABLE) |
| **Version compatibility** | Declare supported Plane CE range in manifest; block on mismatch |
| **Upgrade strategy** | Adapter release independent; contract tests per Plane minor version |
| **Fallback behaviour** | Degraded: read cache if fresh; writes queued to outbox; fail closed if tenant invalid |

---

## Package structure (planned)

```text
integrations/plane/
  integration.yaml
  src/
    plane-adapter.ts          # IntegrationAdapter implementation
    plane-client.ts           # REST client — NEVER exported outside integrations/plane
    mappers/
      project-mapper.ts
      task-mapper.ts
      sprint-mapper.ts
    provisioning/
      workspace-provisioner.ts
    health/
      plane-health-probe.ts
  tests/
    contract/
    integration/
```

---

## PlaneClient (internal)

- REST client for Plane CE API
- Handles pagination, rate limit backoff
- Injects auth header from Vault-resolved token
- **Import rule:** only `plane-adapter.ts` and tests may import `PlaneClient`

---

## Authentication bridge detail

```text
Request → ProjectService (user context)
       → PlaneAdapter.withUserContext(userId)
       → Resolve Plane user ID from mapping (or JIT provision)
       → PlaneClient.request(..., { userToken | serviceToken + userAttribution })
```

| Mode | Use case |
|------|----------|
| Service token | Bulk sync, provisioning, health |
| User-attributed | Comments, assignments — audit shows user |

No Plane login screen. Tokens never sent to browser.

---

## Provisioning flows

### Workspace provision (tenant enable)

```text
1. ProvisioningService → PlaneAdapter.provisionWorkspace(tenantId, spec)
2. POST Plane workspace (idempotent by tenant slug)
3. Store mapping: tenant_id → plane_workspace_id
4. Return ProvisionResult to governance
```

### Project provision

```text
1. ProjectService.createProject(dto)
2. PlaneAdapter.createProject(workspaceId, planeProjectPayload)
3. Store mapping: platform_project_id → plane_project_id
4. Optional: create default modules, states from template
```

---

## Entity mapping store (platform PostgreSQL)

| Column | Purpose |
|--------|---------|
| `platform_id` | APZHUB global ID |
| `plane_id` | Plane UUID |
| `entity_type` | project \| task \| sprint \| module \| label |
| `tenant_id` | Tenant scope |
| `sync_version` | Optimistic concurrency |
| `updated_at` | Audit |

Not exposed via API. Queried only by adapter/service layer.

---

## API surface (adapter methods)

Illustrative interface — implementation in OSS-101-04+:

```typescript
interface PlaneAdapter {
  health(): Promise<AdapterHealthResult>;
  provisionWorkspace(tenantId: string): Promise<ProvisionResult>;
  listProjects(tenantId: string): Promise<PlaneProject[]>;
  getProject(tenantId: string, platformProjectId: string): Promise<PlaneProject>;
  createProject(tenantId: string, input: CreateProjectInput): Promise<PlaneProject>;
  listTasks(tenantId: string, platformProjectId: string, filter?: TaskFilter): Promise<PlaneIssue[]>;
  createTask(...): Promise<PlaneIssue>;
  updateTaskStatus(...): Promise<PlaneIssue>;
  listCycles(...): Promise<PlaneCycle[]>;
  listModules(...): Promise<PlaneModule[]>;
  listMembers(...): Promise<PlaneMember[]>;
  syncUser(tenantId: string, platformUserId: string): Promise<PlaneUserRef>;
}
```

All methods accept tenant context; adapter resolves workspace internally.

---

## Error translation matrix

| Plane response | Platform error category | User message |
|----------------|-------------------------|--------------|
| 401 / 403 | `FORBIDDEN` | You don't have permission for this action |
| 404 | `NOT_FOUND` | Project or task not found |
| 409 | `CONFLICT` | This item was updated elsewhere |
| 422 | `VALIDATION_ERROR` | Invalid input (sanitized) |
| 429 | `RATE_LIMITED` | Too many requests — try again |
| 5xx / timeout | `SERVICE_UNAVAILABLE` | Projects is temporarily unavailable |

Never forward Plane error body or stack trace.

---

## Sync and outbox (PCv2-02)

| Pattern | Usage |
|---------|-------|
| Write-through | User mutation → adapter call → success → event publish |
| Outbox retry | Adapter failure → queue → exponential backoff |
| Reconciliation job | Periodic compare mapping sync_version vs Plane updated_at |
| Idempotency | Idempotency key on create operations |

---

## Version compatibility

| Plane CE version | Adapter support |
|------------------|-----------------|
| Pin TBD at OSS-101-02 | Document in environment guide |
| Contract tests | Mock Plane OpenAPI fixtures |
| Upgrade | Staged: dev → staging → tenant batch |

---

## Health probe

```text
1. Resolve tenant test workspace or global health endpoint
2. Measure round-trip latency
3. Capture Plane version from response header or /api/instances/
4. Return: healthy | degraded (high latency) | unavailable
5. Report to platform-operations capability registry
```

---

## Testing strategy (implementation phases)

| Phase | Tests |
|-------|-------|
| OSS-101-04 | Contract tests with mocked PlaneClient |
| OSS-101-05+ | Integration tests against Plane docker compose |
| OSS-101-10 | E2E via APZHUB UI only — no direct Plane assertions in E2E |

---

## Related

- [Projects Plane Reference Architecture](./APZHUB-Projects-Plane-Reference-Architecture.md)
- [Projects Domain Mapping](./APZHUB-Projects-Domain-Mapping.md)
- [OSS-101 Backlog](../backlog/OSS-101-Plane-Integration-Backlog.md)
