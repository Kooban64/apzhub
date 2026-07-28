# Component and Route Map — ENG-020F Part 3

## Routes

| Path | Component |
| --- | --- |
| `/workspace/qep/requirements/relationships` | `QepRelationshipsListView` |
| `/workspace/qep/requirements/relationships/new` | `QepRelationshipCreateView` |
| `/workspace/qep/requirements/relationships/supersede` | `QepRelationshipSupersedeView` |
| `/workspace/qep/requirements/relationships/{id}` | `QepRelationshipDetailView` |
| Requirement detail embed | `QepRequirementRelationshipsPanel` |

## Source files

| File | Role |
| --- | --- |
| `apps/web/components/qep/qep-relationships-views.tsx` | Workbench UI |
| `apps/web/lib/qep/qep-api.ts` | HTTP client |
| `apps/web/lib/qep/query-keys.ts` | React Query keys |
| `apps/web/lib/qep/telemetry.ts` | Frontend telemetry |
| `packages/qep-requirements/src/presentation/routes.ts` | Path helpers |
| `packages/qep-requirements/src/presentation/navigation.ts` | Sidebar entry |
| `modules/qep-requirements/module.yaml` | Module registration |

## API base

`/api/v1/qep/requirements/relationships/*` (Part 2)
