# Operational — APZHUB-CONTEXT-002

## Consumers

| Consumer      | Focus type  | Mount                                 |
| ------------- | ----------- | ------------------------------------- |
| APZ Projects  | `project`   | Project detail (CONTEXT-001 retained) |
| APZ Workflow  | `workflow`  | Journey detail · Task detail          |
| APZ Support   | `support`   | Request detail                        |
| APZ Knowledge | `knowledge` | Memory object detail                  |

## Consistent panel

Shared `EnterpriseContextPanel` (`apps/web/components/context/`):

- Layout · source attribution (`Source: APZ …`) · link behaviour · empty / loading / error / partial states

## Sections (fixed order)

Projects · Workflow · Support · Documents · Governance (Law) · Knowledge

## Provider resilience

- Unavailable providers → empty slice + `absenceReason: unavailable` + composition `partial: true`
- Partial context shown safely; SoR integrity preserved
- No cross-product writes; no AI; no recommendations

## Out of scope (deferred)

Analytics · Time · AI · proactive context · notifications · automatic actions · editing context
