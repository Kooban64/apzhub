# APZHUB Workflow Persistence Guide

**Milestone:** APZWORKFLOW-001  
**Package:** `@apzhub/workflow-persistence`

---

## Factories

```ts
createWorkflowPersistence({ mode: "memory" });
createWorkflowPersistence({ mode: "postgres", db });
createProductionWorkflowPersistence({ db }); // requires explicit postgres — throws if missing
```

Production helpers **never** fall back to in-memory storage.

---

## Modes

| Mode       | Use                                         |
| ---------- | ------------------------------------------- |
| `memory`   | Unit/integration tests                      |
| `postgres` | Drizzle against `platform_workflow*` tables |

---

## Migrations

| Tag                              | Purpose                                |
| -------------------------------- | -------------------------------------- |
| `0044_apz_platform_workflow`     | Create metadata tables                 |
| `0045_apz_platform_workflow_rls` | Enable RLS + tenant isolation policies |

Schema module: `packages/config/src/db/platform-workflow-schema.ts`.

---

## Tenant isolation

In-memory and PostgreSQL repositories filter by `ctx.tenantId`. Cross-tenant writes throw `tenant_mismatch`.
