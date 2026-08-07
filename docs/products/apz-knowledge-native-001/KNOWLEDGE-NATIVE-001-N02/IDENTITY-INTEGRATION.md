# Identity Integration — APZ-KNOWLEDGE-NATIVE-001-N02

| Field     | Value            |
| --------- | ---------------- |
| Status    | **COMPLETE**     |
| Timestamp | 20260806T073000Z |

## Session

APZ Knowledge consumes the APZHUB session via existing workbench hydration and `useSessionPermissions`.  
No second login. No engine roles.

## Product grants

| Permission        | Role                                  |
| ----------------- | ------------------------------------- |
| `knowledge.view`  | Tenant Member (default product entry) |
| `knowledge.admin` | Elevated / admin only (not default)   |

## Surface

| Element               | Value                                                                   |
| --------------------- | ----------------------------------------------------------------------- |
| Activity Bar          | **APZ Knowledge**                                                       |
| Route                 | `/workspace/knowledge`                                                  |
| Manifest              | `packages/workbench-framework/manifests/platform-knowledge/module.yaml` |
| Product name constant | `KNOWLEDGE_PRODUCT_NAME = "APZ Knowledge"`                              |
| Router                | `KnowledgeWorkspaceRouter`                                              |

## Code anchors

- `packages/platform-authorization/src/authorization-seed.ts`
- `packages/platform-authorization/src/postgres-authorization-store.ts`
- `apps/web/lib/knowledge/*`
- `apps/web/components/knowledge/*`
- `apps/web/components/workbench-page.tsx`
