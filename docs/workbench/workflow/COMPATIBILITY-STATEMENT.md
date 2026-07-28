# Workflow Workbench — Compatibility Statement

> **Programme:** APZHUB-PLATFORM-WORKFLOW-006

| Component                    | Version / status                        | Notes                             |
| ---------------------------- | --------------------------------------- | --------------------------------- |
| Workflow HTTP API            | OpenAPI **1.12.0** `/api/v1/workflow/*` | Sole data path                    |
| `@apzhub/workflow-contracts` | **0.4.2**                               | Not imported by UI                |
| `@apzhub/platform-services`  | **0.28.0**                              | Not imported by UI                |
| `@apzhub/integration-n8n`    | **0.1.0**                               | Not imported by UI                |
| Integration SDK              | **1.0.0**                               | Frozen — unchanged                |
| `/workspace/workflows`       | Unchanged                               | SoR metadata workbench            |
| `/workspace/workflow-engine` | Unchanged                               | Engine workbench                  |
| Commercial APZ Workflow      | Not delivered                           | Beyond Release 1.0 not authorised |

## Compatibility guarantees

- Provider-neutral presentation only.
- Capability flag `workbenchReady=true` on Workflow HTTP capabilities.
- `productReady` remains `false` until a commercial packaging programme.
