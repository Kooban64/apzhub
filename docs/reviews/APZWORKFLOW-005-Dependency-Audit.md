# APZWORKFLOW-005 — Dependency Audit

## Certified versions

| Package                              | Version    |
| ------------------------------------ | ---------- |
| `@apzhub/workflow-contracts`         | **0.2.0**  |
| `@apzhub/workflow-core`              | **0.1.1**  |
| `@apzhub/workflow-persistence`       | **0.1.1**  |
| `@apzhub/platform-service-contracts` | **0.16.0** |
| `@apzhub/platform-services`          | **0.19.0** |

## Dependency direction

```text
workflow-contracts
    ↑
workflow-core
    ↑
workflow-persistence
    ↑
platform-services (gateway.workflow.*)
    ↑
apps/web HTTP handlers
    ↑
apps/web typed client
    ↑
apps/web Workbench UI
```

## Forbidden edges (verified)

| From                               | Must not depend on                                        |
| ---------------------------------- | --------------------------------------------------------- |
| contracts                          | core, persistence, platform-services, apps, n8n           |
| core                               | persistence implementations, platform-services, apps, n8n |
| persistence                        | platform-services, apps, n8n                              |
| platform-services workflow sources | HTTP/UI, n8n, Event Bus                                   |
| HTTP handlers                      | workflow-core, workflow-persistence                       |
| UI / typed client                  | gateway, platform-services, core, persistence             |

**Harness:** `testing/workflow-vertical/apzworkflow-005-boundary.test.ts`  
**Audit:** `pnpm audit:workflow-vertical`
