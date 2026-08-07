# Design Support — Reuse Register

| Asset                          | Path / package                                     | Reuse note                                         |
| ------------------------------ | -------------------------------------------------- | -------------------------------------------------- |
| Projects delivery service      | `packages/platform-services/.../projects-delivery` | Extend for richer registers; do not duplicate SoR  |
| Delivery panels                | `project-delivery-panels.tsx`                      | Pattern for future register UIs                    |
| Enterprise Context panel       | `components/context/enterprise-context-panel.tsx`  | Keep; deepen section content per Bible ch.13       |
| Platform API auth / envelope   | `apps/web/lib/api/v1/*`                            | All new APIs follow existing gateway path          |
| Plane project/task providers   | `packages/platform-services/.../plane`             | Engine SoR for projects/tasks remains              |
| `@apzhub/ui` Button/Input/Card | `packages/ui`                                      | Prefer shared primitives over local one-offs       |
| Design System tokens           | foundation 006 / 028                               | Mandatory for new screens                          |
| Search lifecycle hooks         | `packages/search-projects`                         | Extend when new indexable entities ship            |
| Event manifests                | `events/projects`                                  | Wire Notification Framework when Bible ch.09 lands |
| Workspace frame pattern        | Projects / Support / Knowledge frames              | Consistent Context aside                           |
| React Query keys               | `lib/projects/query-keys.ts`                       | Extend; don’t invent parallel cache                |

## Likely new build (pending Bible)

Board · Gantt · Sprint entity UI · Activity · Comments · Templates — **no reuse today**; plan greenfield against Design System.
