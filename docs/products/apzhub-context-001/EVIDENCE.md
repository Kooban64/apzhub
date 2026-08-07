# Evidence — APZHUB-CONTEXT-001

| Field     | Value              |
| --------- | ------------------ |
| Programme | APZHUB-CONTEXT-001 |
| Release   | MVP                |
| Timestamp | 20260806T133200Z   |

## Implementation evidence

| Artefact                  | Path                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| Service manifest          | `services/enterprise-context/service.yaml`                                                   |
| Contracts                 | `packages/platform-service-contracts/src/services/enterprise-context-composition-service.ts` |
| Composer + providers      | `packages/platform-services/src/services/enterprise-context/`                                |
| HTTP API                  | `apps/web/app/api/v1/context/route.ts`                                                       |
| Handler                   | `apps/web/lib/api/v1/handlers/context.ts`                                                    |
| Consumer client           | `apps/web/lib/context/context-api.ts`                                                        |
| Project Context Panel     | `apps/web/components/projects/enterprise-context-panel.tsx`                                  |
| Wired into project detail | `apps/web/components/projects/project-detail-view.tsx`                                       |

## Test evidence

| Layer                 | Path                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| Unit (composition)    | `packages/platform-services/src/services/enterprise-context/enterprise-context-composition.test.ts` |
| Unit (panel)          | `apps/web/components/projects/enterprise-context-panel.test.tsx`                                    |
| Integration (handler) | `apps/web/lib/api/v1/handlers/context.test.ts`                                                      |
| Architecture boundary | `apps/web/components/projects/projects-architecture-boundary.test.ts`                               |
| Playwright            | `testing/playwright/e2e/apzhub-context-001-project-context.spec.ts`                                 |

## Contract compliance

| Rule                                 | Result       |
| ------------------------------------ | ------------ |
| No new SoR / DB                      | PASS         |
| Compose by reference                 | PASS         |
| Attribution on fragments             | PASS         |
| Consumer uses `/api/v1/context` only | PASS         |
| Read-only                            | PASS         |
| AI / RAG / search / notifications    | OUT OF SCOPE |
