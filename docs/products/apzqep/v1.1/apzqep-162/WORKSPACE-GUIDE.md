# Workspace Guide — APZQEP-162

| Field   | Value                               |
| ------- | ----------------------------------- |
| Route   | `/workspace/qep/scm`                |
| Module  | `modules/qep-scm` (M19 **enabled**) |
| Package | `@apzhub/qep-scm`                   |

## Surfaces

| Surface           | Path                                   |
| ----------------- | -------------------------------------- |
| Home / repos      | `/workspace/qep/scm`                   |
| Providers         | `/workspace/qep/scm/providers`         |
| Repository detail | `/workspace/qep/scm/repositories/{id}` |
| Webhook history   | `/workspace/qep/scm/webhooks`          |

## Supported actions

- Connect GitHub (offline by default)
- Register repository
- Sync branches / commits / pull requests
- Enable / disable repository
- View webhook audit history
- View traceability links

## Not included

Deployment features, CI/CD controls, GitHub Actions UI, AI analysis panels.
