# Command Security — APZQEP-120-S13

| Field   | Value                           |
| ------- | ------------------------------- |
| Package | `@apzhub/qep-command` **0.1.0** |

## Controls

| Control                 | Enforcement                                          |
| ----------------------- | ---------------------------------------------------- |
| RBAC                    | `requiredRoles` / `requiredPermissions` on command   |
| Tenant isolation        | Context `tenantId` scopes QKI discovery              |
| Project isolation       | Project commands require project context when needed |
| Visibility              | `canDiscover` filters catalogue                      |
| Execution authorisation | `canExecute` before handler invoke                   |

## Outcomes

Permission failures return `permission_denied` — never silent bypass.

## Rule

```text
No command bypasses security.
```
