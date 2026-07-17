# APZHUB Workflow Platform Developer Guide

**Milestone:** APZWORKFLOW-001

---

## Packages

| Package | Version | Import |
| --- | --- | --- |
| `@apzhub/workflow-contracts` | 0.1.0 | Types, permissions, service ports |
| `@apzhub/workflow-core` | 0.1.0 | Validation, lifecycle, foundation factory |
| `@apzhub/workflow-persistence` | 0.1.0 | Memory / Postgres repositories |

---

## Quick start (tests)

```ts
import { createWorkflowPersistence } from "@apzhub/workflow-persistence";
import { createWorkflowFoundation } from "@apzhub/workflow-core";

const repos = createWorkflowPersistence({ mode: "memory" });
const foundation = createWorkflowFoundation({ repos });
```

---

## Quality gates

```bash
pnpm --filter @apzhub/workflow-contracts typecheck
pnpm --filter @apzhub/workflow-core typecheck
pnpm --filter @apzhub/workflow-persistence typecheck
pnpm --filter @apzhub/workflow-contracts test
pnpm --filter @apzhub/workflow-core test
pnpm --filter @apzhub/workflow-persistence test
pnpm audit:workflow-foundation
```

---

## Do not

- Import n8n, Meilisearch, Event Bus, BullMQ, apps/web, or Workbench into these packages
- Add `execute` methods to `PlatformWorkflowService` in foundation
- Silently default production persistence to in-memory
- Skip the Module → Service → Connector layering for future execution work
