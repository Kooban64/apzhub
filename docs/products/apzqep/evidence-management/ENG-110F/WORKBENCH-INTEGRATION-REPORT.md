# Workbench Integration Report — APZQEP-ENG-110F

| Field           | Value                                            |
| --------------- | ------------------------------------------------ |
| Base route      | `/workspace/qep/evidence`                        |
| Module manifest | `modules/qep-evidence/module.yaml`               |
| Router          | `apps/web/components/qep/qep-evidence-views.tsx` |
| HTTP client     | `apps/web/lib/qep/qep-evidence-api.ts`           |
| Marker          | `implemented-eng-110f`                           |

Workbench binds exclusively to `/api/v1/qep/evidence` DTOs via the presentation HTTP client. Action bar renders strictly from `availableActions` returned by secured Application services (OES-ENG-091A PART-04 §3.3).

## Routes

| Path                                       | Purpose                    |
| ------------------------------------------ | -------------------------- |
| `/workspace/qep/evidence`                  | Landing                    |
| `/workspace/qep/evidence/explorer`         | List & filter              |
| `/workspace/qep/evidence/collections`      | Collections                |
| `/workspace/qep/evidence/new`              | Capture entry              |
| `/workspace/qep/evidence/items/{id}`       | Detail + lifecycle actions |
| `/workspace/qep/evidence/collections/{id}` | Collection detail          |

Integrated into QEP workspace router alongside Test Plans and Test Execution. Presentation-only — no direct connector or Application layer calls from UI components.
